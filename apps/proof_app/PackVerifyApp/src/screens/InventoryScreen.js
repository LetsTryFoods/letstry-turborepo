import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  Vibration,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { COLORS } from '../constants/theme';
import { SEARCH_PRODUCTS } from '../graphql/queries';
import { ADJUST_INVENTORY, FIND_PRODUCT_BY_IDENTIFIER, SET_INVENTORY } from '../graphql/mutations';
import { getCdnUrl } from '../config/api';

const InventoryScreen = ({ navigation, route }) => {
  const [user] = useState(route.params?.user || { name: 'Packer' });
  const [mode, setMode] = useState('scan'); // 'scan' | 'search'
  const [permission, requestPermission] = useCameraPermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // ── Strategy 1: Exact lookup by SKU or GTIN (used for scanning) ──────────
  // Lazy so we fire it manually on scan or manual code entry.
  const [lookupByIdentifier, { loading: lookupLoading }] = useLazyQuery(
    FIND_PRODUCT_BY_IDENTIFIER,
    {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        const product = data?.findProductByIdentifier;
        if (!product) {
          Alert.alert('Not Found', 'No product matched this barcode/code.');
          return;
        }
        if (product.variants.length === 1) {
          // Only one variant — auto-select it
          handleSelectVariant(product, product.variants[0]);
        } else {
          // Multiple variants — let user pick
          setSelectedProduct(product);
          setSelectedVariant(null); // force user selection
        }
      },
      onError: (err) => {
        Alert.alert('Lookup Failed', err.message);
      },
    },
  );

  // ── Strategy 2: Name-based search (manual text search only) ──────────────
  const { data: searchData, loading: searchLoading, error: searchError } = useQuery(SEARCH_PRODUCTS, {
    variables: { searchTerm: searchQuery },
    skip: searchQuery.length < 3 || mode !== 'search',
  });

  const [setInventory] = useMutation(SET_INVENTORY);

  useEffect(() => {
    if (!permission?.granted && mode === 'scan') requestPermission();
  }, [mode]);

  // ── Scan handler ─────────────────────────────────────────────────────────
  const handleBarcodeScan = ({ data }) => {
    if (scanLocked) return;
    setScanLocked(true);
    Vibration.vibrate(50);

    // Use exact lookup — no name search
    lookupByIdentifier({ variables: { identifier: data } });
    setMode('search'); // switch view to show result
    setTimeout(() => setScanLocked(false), 2000);
  };

  // ── "Enter code manually" handler ────────────────────────────────────────
  const handleManualCodeSubmit = () => {
    if (!searchQuery.trim()) return;

    lookupByIdentifier({ variables: { identifier: searchQuery.trim() } });
  };

  const handleSelectVariant = (product, variant) => {

    setSelectedProduct(product);
    setSelectedVariant(variant);
    // Prefill with current stock so user sees existing value
    setQuantity(String(variant.stockQuantity ?? 0));
  };

  const handleAdjustInventory = async () => {
    if (!selectedVariant) return;
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum < 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid number (0 or more).');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await setInventory({
        variables: {
          identifier: selectedVariant.sku,
          newStockLevel: qtyNum,
          performedBy: user.id || user.name,
        },
      });
      if (response.data?.setInventory) {
        const r = response.data.setInventory;
        Alert.alert(
          '✅ Updated',
          `${selectedProduct.name}\n${selectedVariant.sku}\n\n${r.previousStock} → ${r.newStock}`,
          [{ text: 'OK', onPress: resetState }],
        );
      }
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedVariant(null);
    setSelectedProduct(null);
    setQuantity('1');
    setSearchQuery('');
  };

  const renderVariantPicker = (product) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.pickVariantHint}>Multiple variants — pick one:</Text>
      {product.variants.map((v) => (
        <TouchableOpacity
          key={v._id}
          style={[styles.variantRow, selectedVariant?._id === v._id && styles.selectedVariantRow]}
          onPress={() => handleSelectVariant(product, v)}
        >
          {v.thumbnailUrl ? (
            <TouchableOpacity onPress={() => setZoomedImage(getCdnUrl(v.thumbnailUrl))}>
              <Image source={{ uri: getCdnUrl(v.thumbnailUrl) }} style={styles.variantImage} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <View style={styles.variantInfo}>
            <Text style={styles.variantSku}>SKU: {v.sku}</Text>
            {v.gtin && <Text style={styles.variantGtin}>GTIN: {v.gtin}</Text>}
            <Text style={styles.variantStock}>Stock: {v.stockQuantity}</Text>
          </View>
          <Ionicons
            name={selectedVariant?._id === v._id ? 'checkmark-circle' : 'chevron-forward'}
            size={24}
            color={selectedVariant?._id === v._id ? COLORS.primary : COLORS.textLight}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearchItem = ({ item: product }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{product.name}</Text>
      {product.variants.map((v) => (
        <TouchableOpacity
          key={v._id}
          style={[styles.variantRow, selectedVariant?._id === v._id && styles.selectedVariantRow]}
          onPress={() => handleSelectVariant(product, v)}
        >
          {v.thumbnailUrl ? (
            <TouchableOpacity onPress={() => setZoomedImage(getCdnUrl(v.thumbnailUrl))}>
              <Image source={{ uri: getCdnUrl(v.thumbnailUrl) }} style={styles.variantImage} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <View style={styles.variantInfo}>
            <Text style={styles.variantSku}>SKU: {v.sku}</Text>
            <Text style={styles.variantStock}>Stock: {v.stockQuantity}</Text>
          </View>
          <Ionicons
            name={selectedVariant?._id === v._id ? 'checkmark-circle' : 'chevron-forward'}
            size={24}
            color={selectedVariant?._id === v._id ? COLORS.primary : COLORS.textLight}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Mode Tabs */}
      <View style={styles.headerTabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'scan' && styles.activeTab]}
          onPress={() => setMode('scan')}
        >
          <Ionicons name="barcode-outline" size={20} color={mode === 'scan' ? COLORS.primary : COLORS.textLight} />
          <Text style={[styles.tabText, mode === 'scan' && styles.activeTabText]}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'search' && styles.activeTab]}
          onPress={() => setMode('search')}
        >
          <Ionicons name="search-outline" size={20} color={mode === 'search' ? COLORS.primary : COLORS.textLight} />
          <Text style={[styles.tabText, mode === 'search' && styles.activeTabText]}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {mode === 'scan' ? (
          // ─── Scan Mode ──────────────────────────────────────────────────
          permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'code128'] }}
              onBarcodeScanned={handleBarcodeScan}
            >
              <View style={styles.scanFrameContainer}>
                {lookupLoading && <ActivityIndicator color="white" size="large" />}
                <View style={styles.scanFrame} />
                <Text style={styles.scanHint}>Align barcode within the frame</Text>
              </View>
            </CameraView>
          ) : (
            <View style={styles.noPerm}>
              <Text style={{ color: COLORS.textDark }}>Camera permission required</Text>
              <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
                <Text style={styles.permBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          // ─── Manual Mode ─────────────────────────────────────────────────
          <View style={styles.searchContainer}>

            {/* Input: type a code (SKU/GTIN) for exact lookup */}
            <View style={styles.codeRow}>
              <View style={styles.codeInputWrapper}>
                <Ionicons name="qr-code-outline" size={20} color={COLORS.textLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter SKU or GTIN code..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  returnKeyType="search"
                  onSubmitEditing={handleManualCodeSubmit}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); resetState(); }}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.lookupBtn} onPress={handleManualCodeSubmit} disabled={lookupLoading}>
                {lookupLoading
                  ? <ActivityIndicator color="white" size="small" />
                  : <Ionicons name="search" size={20} color="white" />}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.orRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or search by name</Text>
              <View style={styles.divider} />
            </View>

            {/* Name search (only fires when ≥ 3 chars) */}
            <View style={styles.searchInputWrapper}>
              <Ionicons name="text-outline" size={20} color={COLORS.textLight} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by product name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Inline variant picker after exact lookup */}
            {selectedProduct && !selectedVariant && selectedProduct.variants.length > 1 && (
              renderVariantPicker(selectedProduct)
            )}

            {/* Name search results */}
            {searchLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
            ) : (
              <FlatList
                data={searchData?.searchProducts?.items || []}
                keyExtractor={item => item._id}
                renderItem={renderSearchItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  searchQuery.length >= 3
                    ? <Text style={styles.emptyText}>No products found for "{searchQuery}"</Text>
                    : null
                }
              />
            )}
          </View>
        )}
      </View>

      {/* Bottom Sheet — Adjust Stock */}
      {selectedVariant && (
        <View style={styles.adjustmentSheet}>
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>Adjust Stock</Text>
              <Text style={styles.sheetSub} numberOfLines={1}>{selectedProduct?.name} · {selectedVariant.sku}</Text>
              <Text style={styles.sheetStock}>Current stock: {selectedVariant.stockQuantity}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedVariant(null)}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(prev => (parseInt(prev || '0') - 1).toString())}
            >
              <Ionicons name="remove" size={28} color={COLORS.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.qtyInput}
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(prev => (parseInt(prev || '0') + 1).toString())}
            >
              <Ionicons name="add" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleAdjustInventory}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator color="white" />
              : <>
                <Ionicons name="cloud-upload" size={20} color="white" />
                <Text style={styles.submitBtnText}>Update Inventory</Text>
              </>}
          </TouchableOpacity>
        </View>
      )}

      {/* Image Zoom Modal */}
      <Modal visible={!!zoomedImage} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setZoomedImage(null)} />
          <View style={styles.modalContent}>
            {zoomedImage && (
              <Image source={{ uri: zoomedImage }} style={styles.zoomedImage} resizeMode="contain" />
            )}
            <TouchableOpacity style={styles.closeZoomBtn} onPress={() => setZoomedImage(null)}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTabs: {
    flexDirection: 'row', backgroundColor: 'white',
    paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },

  content: { flex: 1 },

  // Camera
  scanFrameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  scanFrame: { width: 260, height: 160, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12 },
  scanHint: { color: 'white', fontSize: 13, fontWeight: '500' },

  // Manual
  searchContainer: { flex: 1, padding: 15 },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  codeInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 12, borderWidth: 1,
    borderColor: '#e2e8f0', paddingHorizontal: 12, height: 50,
  },
  codeInput: { flex: 1, fontSize: 15, color: COLORS.textDark },
  lookupBtn: {
    width: 50, height: 50, backgroundColor: COLORS.primary,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  orText: { color: COLORS.textLight, fontSize: 12, fontWeight: '500' },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    marginBottom: 15, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#e2e8f0', height: 50,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textDark },

  pickVariantHint: { fontSize: 12, color: COLORS.textLight, marginBottom: 6 },
  listContent: { paddingBottom: 200 },
  productCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 15,
    marginBottom: 12, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  productName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  variantRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  selectedVariantRow: { backgroundColor: '#f0f9ff', borderRadius: 8, paddingHorizontal: 8 },
  variantImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#f1f5f9' },
  placeholderImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#f1f5f9' },
  variantInfo: { flex: 1 },
  variantSku: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  variantGtin: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  variantStock: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold', marginTop: 3 },
  emptyText: { textAlign: 'center', marginTop: 30, color: COLORS.textLight, fontSize: 14 },

  // Bottom Sheet
  adjustmentSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 12,
  },
  sheetHeader: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  sheetTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textDark },
  sheetSub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  sheetStock: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  qtyContainer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 20, gap: 24,
  },
  qtyBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center',
  },
  qtyInput: { fontSize: 36, fontWeight: 'bold', color: COLORS.textDark, minWidth: 80 },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  noPerm: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permBtn: {
    marginTop: 20, backgroundColor: COLORS.primary,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  permBtnText: { color: 'white', fontWeight: 'bold' },

  // Zoom Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalCloseArea: { ...StyleSheet.absoluteFillObject },
  modalContent: { width: '90%', height: '70%', justifyContent: 'center', alignItems: 'center' },
  zoomedImage: { width: '100%', height: '100%', borderRadius: 12 },
  closeZoomBtn: { position: 'absolute', top: -40, right: 0, padding: 8 },
});

export default InventoryScreen;
