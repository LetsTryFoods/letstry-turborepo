import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  Modal,
} from 'react-native';

import { useMutation, useLazyQuery } from '@apollo/client';
import { BATCH_SCAN_ITEMS, COMPLETE_PACKING, UPLOAD_EVIDENCE, GET_DELIVERY_RECOMMENDATION } from '../graphql/queries';
import { COLORS } from '../constants/theme';

const CameraScreen = ({ navigation, route }) => {
  const { order, user } = route.params;
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [items, setItems] = useState(
    order.items.map(i => ({ ...i, scannedQty: i.scannedCount || 0 }))
  );
  const pendingScans = useRef({});
  const [scanLocked, setScanLocked] = useState(false);
  const [allScanned, setAllScanned] = useState(false);
  const [boxPhotoUri, setBoxPhotoUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const [batchScanMutation] = useMutation(BATCH_SCAN_ITEMS);
  const [uploadEvidenceMutation] = useMutation(UPLOAD_EVIDENCE);
  const [completePackingMutation] = useMutation(COMPLETE_PACKING);
  const [getRecommendation, { data: recommendationData }] = useLazyQuery(GET_DELIVERY_RECOMMENDATION);

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('DTDC');

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  useEffect(() => {
    const done = items.every(i => i.scannedQty >= i.quantity);
    if (done && items.length > 0 && !allScanned) {
      setAllScanned(true);
      getRecommendation({ variables: { orderId: order.orderId } });
      Alert.alert('✅ All Items Scanned!', 'Now take a photo of the packed box.');
    }
  }, [items]);

  const handleBarcodeScan = async ({ data }) => {
    if (scanLocked || allScanned) return;
    setScanLocked(true);
    setLastScanned(data);

    const matchedItem = items.find(i => i.ean === data);
    if (!matchedItem) {
      Vibration.vibrate();
      Alert.alert('Unknown EAN', `${data} is not in this order.`);
      setTimeout(() => setScanLocked(false), 800);
      return;
    }

    if (matchedItem.scannedQty >= matchedItem.quantity) {
      Vibration.vibrate();
      Alert.alert('Already Scanned', `${matchedItem.name} is already fully scanned.`);
      setTimeout(() => setScanLocked(false), 800);
      return;
    }

    const pid = matchedItem.productId;
    if (!pendingScans.current[pid]) pendingScans.current[pid] = [];
    pendingScans.current[pid].push(data);

    const collected = pendingScans.current[pid].length;
    const needed = matchedItem.quantity;

    if (collected < needed) {
      setItems(prev =>
        prev.map(i => i.productId === pid ? { ...i, scannedQty: collected } : i)
      );
      setTimeout(() => setScanLocked(false), 800);
      return;
    }

    try {
      const response = await batchScanMutation({
        variables: {
          input: {
            packingOrderId: order.id,
            items: [{ productId: pid, eans: pendingScans.current[pid] }],
          },
        },
        errorPolicy: 'all',
      });

      if (response.errors?.length) {
        Vibration.vibrate();
        pendingScans.current[pid] = [];
        Alert.alert('Scan Error', response.errors[0].message);
        return;
      }

      const validation = response?.data?.batchScanItems?.validations?.[0];
      if (!validation?.isValid) {
        Vibration.vibrate();
        pendingScans.current[pid] = [];
        Alert.alert('Invalid', validation?.errorMessage || 'Scan failed');
        return;
      }

      setItems(prev =>
        prev.map(i => i.productId === pid ? { ...i, scannedQty: needed } : i)
      );
    } catch (err) {
      pendingScans.current[pid] = [];
      Alert.alert('Network Error', err.message);
    } finally {
      setTimeout(() => setScanLocked(false), 800);
    }
  };

  const takeBoxPhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setBoxPhotoUri(photo.uri);
  };

  const retakePhoto = () => setBoxPhotoUri(null);

  const submitOrder = async () => {
    if (!boxPhotoUri) {
      Alert.alert('Missing Photo', 'Please take a photo of the packed box.');
      return;
    }
    setShowPartnerModal(true);
  };

  const finalizeCompletion = async () => {
    setShowPartnerModal(false);
    setIsSubmitting(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(boxPhotoUri, { encoding: 'base64' });

      await uploadEvidenceMutation({
        variables: {
          input: {
            packingOrderId: order.id,
            prePackImages: [base64],
            postPackImages: [],
            actualBoxCode: null,
          },
        },
      });

      await completePackingMutation({
        variables: { 
          packingOrderId: order.id,
          provider: selectedProvider,
          serviceType: selectedProvider === 'DTDC' ? 'GROUND EXPRESS' : 'Standard'
        },
      });

      Alert.alert('🎉 Order Complete!', `Order #${order.orderNumber} packed by ${user.name}`, [
        { text: 'Back to Dashboard', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (err) {
      Alert.alert('Submit Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (allScanned) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        {boxPhotoUri ? (
          <View style={styles.container}>
            <View style={styles.photoHeader}>
              <Text style={styles.photoTitle}>Box Photo Preview</Text>
              <Text style={styles.photoSub}>Order #{order.orderNumber} — Packed by {user.name}</Text>
            </View>
            <View style={styles.photoPreview}>
              <Ionicons name="image" size={80} color="#555" />
              <Text style={styles.photoCapured}>Photo captured ✓</Text>
            </View>
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
                <Ionicons name="refresh" size={20} color={COLORS.textDark} />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitOrder} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>Complete Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <CameraView style={{ flex: 1 }} ref={cameraRef}>
            <View style={styles.photoOverlay}>
              <View style={styles.photoPromptBox}>
                <Ionicons name="camera" size={36} color="#fff" />
                <Text style={styles.photoPromptTitle}>Take Box Photo</Text>
                <Text style={styles.photoPromptSub}>Capture the sealed packed box with all items inside</Text>
              </View>
              <TouchableOpacity style={styles.shutterBtn} onPress={takeBoxPhoto}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        )}

        <Modal
          visible={showPartnerModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPartnerModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Delivery Partner</Text>
              
              {recommendationData?.getDeliveryRecommendation && (
                <View style={styles.recommendationBox}>
                  <View style={styles.recommendationHeader}>
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text style={styles.recommendationText}>RECOMMENDED</Text>
                  </View>
                  <Text style={styles.recommendedProvider}>
                    {recommendationData.getDeliveryRecommendation.recommendedProvider}
                  </Text>
                  <Text style={styles.recommendationReason}>
                    {recommendationData.getDeliveryRecommendation.reason}
                  </Text>
                </View>
              )}

              <View style={styles.partnerOptions}>
                <TouchableOpacity 
                  style={[styles.partnerOption, selectedProvider === 'DTDC' && styles.partnerSelected]}
                  onPress={() => setSelectedProvider('DTDC')}
                >
                  <Ionicons name="bus" size={24} color={selectedProvider === 'DTDC' ? COLORS.primary : '#64748b'} />
                  <Text style={[styles.partnerName, selectedProvider === 'DTDC' && styles.partnerNameSelected]}>DTDC</Text>
                  {selectedProvider === 'DTDC' && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.partnerOption, selectedProvider === 'SHIPROCKET' && styles.partnerSelected]}
                  onPress={() => setSelectedProvider('SHIPROCKET')}
                >
                  <Ionicons name="rocket" size={24} color={selectedProvider === 'SHIPROCKET' ? COLORS.primary : '#64748b'} />
                  <Text style={[styles.partnerName, selectedProvider === 'SHIPROCKET' && styles.partnerNameSelected]}>SHIPROCKET</Text>
                  {selectedProvider === 'SHIPROCKET' && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPartnerModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={finalizeCompletion}>
                  <Text style={styles.modalConfirmText}>Confirm & Finish</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView
        style={{ flex: 1 }}
        ref={cameraRef}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'code128'] }}
        onBarcodeScanned={handleBarcodeScan}
      >
        <View style={styles.scanOverlay}>
          <Text style={styles.overlayTitle}>📦 Scan Items — Order #{order.orderNumber}</Text>
          {lastScanned ? (
            <Text style={styles.lastScanned}>Last scanned: {lastScanned}</Text>
          ) : null}
          <View style={styles.divider} />
          {items.map((item, idx) => {
            const done = item.scannedQty >= item.quantity;
            const pending = pendingScans.current[item.productId]?.length || 0;
            const display = done ? item.quantity : pending;
            return (
              <View key={idx} style={styles.itemRow}>
                <Ionicons
                  name={done ? 'checkmark-circle' : pending > 0 ? 'hourglass-outline' : 'ellipse-outline'}
                  size={20}
                  color={done ? '#4ade80' : pending > 0 ? '#fb923c' : '#facc15'}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.itemName, done && styles.itemDone]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemCount, done && styles.itemCountDone]}>
                  {display}/{item.quantity}
                </Text>
              </View>
            );
          })}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${(items.reduce((s, i) => s + Math.min(i.scannedQty, i.quantity), 0) / items.reduce((s, i) => s + i.quantity, 0)) * 100}%`
            }]} />
          </View>
          <Text style={styles.progressText}>
            {items.reduce((s, i) => s + Math.min(i.scannedQty, i.quantity), 0)} / {items.reduce((s, i) => s + i.quantity, 0)} scanned
          </Text>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center' },
  permText: { color: '#fff', fontSize: 16, marginBottom: 16 },
  permBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  permBtnText: { color: '#fff', fontWeight: 'bold' },

  scanOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.88)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
  },
  overlayTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  lastScanned: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemName: { flex: 1, color: '#e2e8f0', fontSize: 14 },
  itemDone: { color: '#4ade80' },
  itemCount: { color: '#facc15', fontWeight: 'bold', fontSize: 14, minWidth: 36, textAlign: 'right' },
  itemCountDone: { color: '#4ade80' },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  progressText: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 6 },

  photoOverlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60 },
  photoPromptBox: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 16, padding: 24, alignItems: 'center', marginHorizontal: 24 },
  photoPromptTitle: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginTop: 12 },
  photoPromptSub: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 8 },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },

  photoHeader: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50 },
  photoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  photoSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  photoPreview: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  photoCapured: { color: '#aaa', marginTop: 12 },
  photoActions: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', gap: 12 },
  retakeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, height: 52, gap: 8 },
  retakeBtnText: { fontWeight: '600', color: COLORS.textDark },
  submitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22c55e', borderRadius: 12, height: 52, gap: 8 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 20, textAlign: 'center' },
  recommendationBox: { backgroundColor: '#fffbeb', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#fef3c7' },
  recommendationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  recommendationText: { fontSize: 11, fontWeight: 'bold', color: '#b45309', letterSpacing: 0.5 },
  recommendedProvider: { fontSize: 18, fontWeight: 'bold', color: '#92400e', marginBottom: 4 },
  recommendationReason: { fontSize: 12, color: '#b45309' },
  partnerOptions: { gap: 12, marginBottom: 24 },
  partnerOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', gap: 12 },
  partnerSelected: { borderColor: COLORS.primary, backgroundColor: '#f0f9ff' },
  partnerName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#64748b' },
  partnerNameSelected: { color: COLORS.textDark },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { color: '#64748b', fontWeight: '600' },
  modalConfirm: { flex: 2, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CameraScreen;
