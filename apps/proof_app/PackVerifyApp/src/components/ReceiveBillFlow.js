import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Vibration, Image, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../constants/theme';
import { CREATE_PURCHASE_ORDER, RECEIVE_STOCK_BATCH, FIND_PRODUCT_BY_IDENTIFIER } from '../graphql/mutations';
import { GET_PURCHASE_ORDERS, SEARCH_PRODUCTS } from '../graphql/queries';
import * as ImagePicker from 'expo-image-picker';
import { API_URL, getCdnUrl } from '../config/api';

export default function ReceiveBillFlow({ user }) {
  const [activePo, setActivePo] = useState(null); // { _id, billNumber }
  const [sessionState, setSessionState] = useState('select'); // 'select', 'new', 'scan'

  // Form for New PO
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorName, setVendorName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billPhotos, setBillPhotos] = useState([]);

  // Scanning State
  const [permission, requestPermission] = useCameraPermissions();
  const [scanLocked, setScanLocked] = useState(false);
  const [pendingVariant, setPendingVariant] = useState(null);
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchText, setSearchText] = useState('');

  // GraphQL
  const { data: poData, loading: poLoading, refetch: refetchPos } = useQuery(GET_PURCHASE_ORDERS, { variables: { page: 1, limit: 15 }, fetchPolicy: 'network-only' });
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_PRODUCTS, {
    variables: { searchTerm: searchText },
    skip: searchText.length < 3 || sessionState !== 'scan',
  });
  const [createPo, { loading: creatingPo }] = useMutation(CREATE_PURCHASE_ORDER);
  const [receiveBatch, { loading: receivingBatch }] = useMutation(RECEIVE_STOCK_BATCH);
  const [lookupByIdentifier] = useLazyQuery(FIND_PRODUCT_BY_IDENTIFIER, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (sessionState === 'scan' && !permission?.granted) requestPermission();
  }, [sessionState]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed');

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setBillPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleCreatePo = async () => {
    if (!billNumber) return Alert.alert('Required', 'Bill Number is required.');
    try {
      let uploadedKeys = [];
      if (billPhotos.length > 0) {
        const restApiUrl = API_URL.replace('/graphql', '');
        uploadedKeys = await Promise.all(
          billPhotos.map(async (uri, index) => {
            const filename = `bill-${Date.now()}-${index}.jpg`;
            const presignedRes = await fetch(`${restApiUrl}/files/presigned-url`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename, contentType: 'image/jpeg' }),
            });
            if (!presignedRes.ok) throw new Error('Failed to get upload URL');
            const presignedData = await presignedRes.json();

            const response = await fetch(uri);
            const blob = await response.blob();

            const uploadRes = await fetch(presignedData.uploadUrl, {
              method: 'PUT',
              body: blob,
              headers: { 'Content-Type': 'image/jpeg' },
            });
            if (!uploadRes.ok) throw new Error('Failed to upload image to CDN');

            return presignedData.key;
          })
        );
      }

      const res = await createPo({
        variables: {
          input: {
            billNumber,
            billDate,
            vendorName,
            totalAmount: parseFloat(totalAmount) || undefined,
            billImageUrls: uploadedKeys,
            performedBy: user.name || user.id,
          }
        }
      });
      if (res.data?.createPurchaseOrder) {
        setActivePo(res.data.createPurchaseOrder);
        setSessionState('scan');
        setBillNumber(''); setVendorName(''); setTotalAmount(''); setBillPhotos([]);
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleBarcodeScan = async ({ data }) => {
    if (scanLocked || pendingVariant) return;
    setScanLocked(true);
    Vibration.vibrate(50);
    try {
      const res = await lookupByIdentifier({ variables: { identifier: data } });
      const product = res.data?.findProductByIdentifier;
      if (!product || product.variants.length === 0) {
        Alert.alert('Not Found', 'No product matched this barcode.');
      } else {
        setPendingVariant({ product, variant: product.variants[0] });
        setQty('1');
        setExpiry('');
      }
    } catch (e) { Alert.alert('Error', e.message); }
    setTimeout(() => setScanLocked(false), 2000);
  };

  const handleSaveBatch = async () => {
    if (!expiry) return Alert.alert('Required', 'Expiry Date (YYYY-MM-DD) is required.');
    const q = parseInt(qty);
    if (isNaN(q) || q <= 0) return Alert.alert('Invalid', 'Quantity must be > 0');

    try {
      await receiveBatch({
        variables: {
          input: {
            purchaseOrderId: activePo._id,
            sku: pendingVariant.variant.sku,
            quantityAdded: q,
            expiryDate: expiry,
            performedBy: user.name || user.id,
          }
        }
      });
      Alert.alert('Saved', 'Batch linked to ' + activePo.billNumber);
      setPendingVariant(null);
    } catch (e) { Alert.alert('Error', e.message); }
  };

  if (sessionState === 'select') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => setSessionState('new')}>
          <Text style={styles.btnText}>+ Create New Bill</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Or Resume Recent Bill:</Text>
        {poLoading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
          <FlatList
            data={poData?.purchaseOrders || []}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.poCard} onPress={() => { setActivePo(item); setSessionState('scan'); }}>
                <Text style={styles.poTitle}>{item.billNumber}</Text>
                <Text style={styles.poSub}>{item.vendorName || 'No Vendor'} • {item.billDate}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.textLight }}>No recent bills found.</Text>}
          />
        )}
      </View>
    );
  }

  if (sessionState === 'new') {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSessionState('select')} style={{ marginBottom: 10 }}>
          <Text style={{ color: COLORS.primary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Bill Details</Text>

        <Text style={styles.label}>Bill / Invoice Number *</Text>
        <TextInput style={styles.input} placeholder="e.g. INV-100" value={billNumber} onChangeText={setBillNumber} />

        <Text style={styles.label}>Bill Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} placeholder="e.g. 2025-10-31" value={billDate} onChangeText={setBillDate} maxLength={10} />

        <Text style={styles.label}>Vendor / Supplier Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Supplier XYZ" value={vendorName} onChangeText={setVendorName} />

        <Text style={styles.label}>Total Amount (₹)</Text>
        <TextInput style={styles.input} placeholder="e.g. 5000" keyboardType="numeric" value={totalAmount} onChangeText={setTotalAmount} />

        <Text style={styles.label}>Bill Photos</Text>
        <ScrollView horizontal style={{ flexDirection: 'row', marginBottom: 16 }} showsHorizontalScrollIndicator={false}>
          {billPhotos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }} />
          ))}
          <TouchableOpacity
            style={{ width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}
            onPress={handlePickImage}
          >
            <Ionicons name="camera" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleCreatePo} disabled={creatingPo}>
          {creatingPo ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Start Scanning</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  if (sessionState === 'scan') {
    return (
      <KeyboardAvoidingView style={styles.scanContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}>
        <View style={styles.activePoHeader}>
          <Text style={styles.activePoText}>Active Bill: {activePo?.billNumber}</Text>
          <TouchableOpacity onPress={() => { setActivePo(null); refetchPos(); setSessionState('select'); }}>
            <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: '#fff', padding: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f5f8', borderRadius: 8, paddingHorizontal: 10 }}>
            <Ionicons name="search" size={20} color={COLORS.textLight} />
            <TextInput
              style={{ flex: 1, padding: 12, fontSize: 16 }}
              placeholder="Search by Name, SKU or Barcode..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={(e) => {
                if (searchText.trim()) handleBarcodeScan({ data: searchText.trim() });
              }}
              returnKeyType="search"
            />
          </View>
        </View>

        {searchText.length >= 3 && (
          <View style={{ backgroundColor: '#fff', maxHeight: 250, marginHorizontal: 10, borderRadius: 8, elevation: 5, marginTop: 5, zIndex: 10 }}>
            {searchLoading ? <ActivityIndicator style={{ padding: 20 }} /> : (
              <FlatList
                data={searchData?.searchProducts?.items || []}
                keyExtractor={item => item._id || item.id || Math.random().toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <View>
                    {item.variants.map(v => (
                      <TouchableOpacity
                        key={v.sku}
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => {
                          setPendingVariant({ product: item, variant: v });
                          setQty('1');
                          setExpiry('');
                          setSearchText('');
                          Keyboard.dismiss();
                        }}
                      >
                        {v.thumbnailUrl ? (
                          <Image source={{ uri: getCdnUrl(v.thumbnailUrl) }} style={{ width: 40, height: 40, borderRadius: 6, marginRight: 12, backgroundColor: '#f0f0f0' }} />
                        ) : (
                          <View style={{ width: 40, height: 40, borderRadius: 6, marginRight: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="image-outline" size={20} color="#ccc" />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>{item.name}</Text>
                          <Text style={{ color: COLORS.textLight, fontSize: 12, marginTop: 2 }}>
                            SKU: {v.sku}  •  {v.weight}{v.weightUnit}  •  ₹{v.mrp}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                ListEmptyComponent={<Text style={{ padding: 15, textAlign: 'center', color: COLORS.textLight }}>No products found</Text>}
              />
            )}
          </View>
        )}

        <View style={{ flex: 1 }}>
          {permission?.granted ? (
            <CameraView style={StyleSheet.absoluteFill} barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'code128'] }} onBarcodeScanned={handleBarcodeScan}>
              <View style={styles.scanFrameContainer}>
                <View style={styles.scanFrame} />
              </View>
            </CameraView>
          ) : <Text style={{ textAlign: 'center', marginTop: 50 }}>No camera permission.</Text>}
        </View>

        {pendingVariant && (
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{pendingVariant.product.name}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: COLORS.textLight }}>SKU: {pendingVariant.variant.sku}</Text>
              <Text style={{ color: COLORS.textDark, fontWeight: 'bold' }}>Stock: {pendingVariant.variant.stockQuantity ?? 0}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Qty</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={qty} onChangeText={setQty} />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Expiry Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 16, color: expiry ? COLORS.textDark : '#aaa' }}>
                    {expiry ? expiry : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={expiry ? new Date(expiry) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setExpiry(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: COLORS.danger, flex: 1 }]} onPress={() => setPendingVariant(null)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { flex: 2 }]} onPress={handleSaveBatch} disabled={receivingBatch}>
                {receivingBatch ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save to Bill</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f5f8' },
  scanContainer: { flex: 1, backgroundColor: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 16 },
  btnPrimary: { backgroundColor: COLORS.secondary, padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  poCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  poTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  poSub: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  activePoHeader: { backgroundColor: COLORS.secondary, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activePoText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scanFrameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: COLORS.secondary, borderRadius: 16, backgroundColor: 'transparent' },
  modal: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
});
