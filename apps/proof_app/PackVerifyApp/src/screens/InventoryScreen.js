import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { COLORS } from '../constants/theme';
import { SEARCH_PRODUCTS } from '../graphql/queries';
import {
  FIND_PRODUCT_BY_IDENTIFIER,
  SET_INVENTORY,
  RECORD_STOCK_INWARD,
} from '../graphql/mutations';
import { getCdnUrl } from '../config/api';

/**
 * InventoryScreen — two operation modes:
 *
 *  • "Add Stock" (INWARD)  — scanned when new goods arrive.
 *    Enters qty TO ADD (delta), recorded as INWARD action.
 *    availabilityStatus auto-syncs to in_stock.
 *
 *  • "Set Stock" (absolute) — enter the exact current stock count.
 *    Recorded as MANUAL_ADJUSTMENT.
 */
const InventoryScreen = ({ navigation, route }) => {
  const [user] = useState(route.params?.user || { name: 'Packer' });

  // 'scan' | 'search'
  const [mode, setMode] = useState('scan');
  // 'inward' | 'set' — operation type selected in bottom sheet
  const [opMode, setOpMode] = useState('inward');

  const [permission, requestPermission] = useCameraPermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // For inward: qty to ADD. For set: absolute target qty.
  const [quantity, setQuantity] = useState('');
  const [vendor, setVendor] = useState('');
  const [poRef, setPoRef] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // ── Exact lookup by SKU / GTIN ──────────────────────────────────────────
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
          handleSelectVariant(product, product.variants[0]);
        } else {
          setSelectedProduct(product);
          setSelectedVariant(null);
        }
      },
      onError: (err) => Alert.alert('Lookup Failed', err.message),
    },
  );

  // ── Name search ──────────────────────────────────────────────────────────
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_PRODUCTS, {
    variables: { searchTerm: searchQuery },
    skip: searchQuery.length < 3 || mode !== 'search',
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const [recordStockInward] = useMutation(RECORD_STOCK_INWARD);
  const [setInventoryMutation] = useMutation(SET_INVENTORY);

  useEffect(() => {
    if (!permission?.granted && mode === 'scan') requestPermission();
  }, [mode]);

  // ── Scan ─────────────────────────────────────────────────────────────────
  const handleBarcodeScan = ({ data }) => {
    if (scanLocked) return;
    setScanLocked(true);
    Vibration.vibrate(50);
    lookupByIdentifier({ variables: { identifier: data } });
    setMode('search');
    setTimeout(() => setScanLocked(false), 2000);
  };

  const handleManualCodeSubmit = () => {
    if (!searchQuery.trim()) return;
    lookupByIdentifier({ variables: { identifier: searchQuery.trim() } });
  };

  const handleSelectVariant = (product, variant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    // Add Stock → default 1 (units to add)
    // Set Stock → default to current stock so user sees existing quantity directly
    setQuantity(opMode === 'inward' ? '1' : String(variant.stockQuantity ?? 0));
    setVendor('');
    setPoRef('');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedVariant) return;
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum < 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid number (0 or more).');
      return;
    }
    if (opMode === 'inward' && qtyNum === 0) {
      Alert.alert('Invalid Quantity', 'Quantity to add must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (opMode === 'inward') {
        // ── Stock In: add qty to existing stock ──────────────────────────
        const res = await recordStockInward({
          variables: {
            identifier: selectedVariant.sku,
            quantityAdded: qtyNum,
            vendor: vendor.trim() || undefined,
            purchaseOrderRef: poRef.trim() || undefined,
            performedBy: user.id || user.name,
            notes: vendor.trim()
              ? `Stock received from ${vendor.trim()}`
              : 'Stock inward via Proof App scan',
          },
        });
        if (res.data?.recordStockInward) {
          const r = res.data.recordStockInward;
          Alert.alert(
            '✅ Stock Added',
            `${selectedProduct.name}\nSKU: ${selectedVariant.sku}\n\n` +
              `${r.previousStock} → ${r.newStock} units\n` +
              `(+${r.changeAmount} added)`,
            [{ text: 'Done', onPress: resetState }],
          );
        }
      } else {
        // ── Set Stock: set absolute stock level ──────────────────────────
        const res = await setInventoryMutation({
          variables: {
            identifier: selectedVariant.sku,
            newStockLevel: qtyNum,
            performedBy: user.id || user.name,
          },
        });
        if (res.data?.setInventory) {
          const r = res.data.setInventory;
          Alert.alert(
            '✅ Stock Updated',
            `${selectedProduct.name}\nSKU: ${selectedVariant.sku}\n\n` +
              `${r.previousStock} → ${r.newStock} units`,
            [{ text: 'Done', onPress: resetState }],
          );
        }
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
    setQuantity('');
    setSearchQuery('');
    setVendor('');
    setPoRef('');
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const statusColor = (status) =>
    status === 'in_stock' ? COLORS.secondary : COLORS.danger;

  const statusLabel = (status) =>
    status === 'in_stock' ? 'In Stock' : 'Out of Stock';

  // ── Render variant row ────────────────────────────────────────────────────
  const VariantRow = ({ product, variant }) => (
    <TouchableOpacity
      style={[
        styles.variantRow,
        selectedVariant?._id === variant._id && styles.selectedVariantRow,
      ]}
      onPress={() => handleSelectVariant(product, variant)}
    >
      {variant.thumbnailUrl ? (
        <TouchableOpacity onPress={() => setZoomedImage(getCdnUrl(variant.thumbnailUrl))}>
          <Image source={{ uri: getCdnUrl(variant.thumbnailUrl) }} style={styles.variantImage} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderImage} />
      )}
      <View style={styles.variantInfo}>
        <Text style={styles.variantSku}>{variant.sku}</Text>
        {variant.gtin && <Text style={styles.variantGtin}>GTIN: {variant.gtin}</Text>}
        <View style={styles.variantStockRow}>
          <Text style={styles.variantStock}>{variant.stockQuantity} units</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(variant.availabilityStatus) + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor(variant.availabilityStatus) }]}>
              {statusLabel(variant.availabilityStatus)}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons
        name={selectedVariant?._id === variant._id ? 'checkmark-circle' : 'chevron-forward'}
        size={24}
        color={selectedVariant?._id === variant._id ? COLORS.primary : COLORS.textLight}
      />
    </TouchableOpacity>
  );

  const renderSearchItem = ({ item: product }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{product.name}</Text>
      {product.variants.map((v) => (
        <VariantRow key={v._id} product={product} variant={v} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Op Mode Toggle (top pill) ─────────────────────────────────── */}
      <View style={styles.opModeBar}>
        <TouchableOpacity
          style={[styles.opPill, opMode === 'inward' && styles.opPillActive]}
          onPress={() => {
            setOpMode('inward');
            // When switching to Add Stock, reset quantity to 1
            if (selectedVariant) setQuantity('1');
          }}
        >
          <Ionicons
            name="arrow-down-circle-outline"
            size={16}
            color={opMode === 'inward' ? 'white' : COLORS.textLight}
          />
          <Text style={[styles.opPillText, opMode === 'inward' && styles.opPillTextActive]}>
            Add Stock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opPill, opMode === 'set' && styles.opPillSetActive]}
          onPress={() => {
            setOpMode('set');
            // When switching to Set Stock, pre-fill with current stock so user sees 11 directly
            if (selectedVariant) setQuantity(String(selectedVariant.stockQuantity ?? 0));
          }}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={opMode === 'set' ? 'white' : COLORS.textLight}
          />
          <Text style={[styles.opPillText, opMode === 'set' && styles.opPillTextActive]}>
            Set Stock
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Scan / Manual tabs ───────────────────────────────────────────── */}
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
          <Text style={[styles.tabText, mode === 'search' && styles.activeTabText]}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <View style={styles.content}>
        {mode === 'scan' ? (
          permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'code128'] }}
              onBarcodeScanned={handleBarcodeScan}
            >
              <View style={styles.scanFrameContainer}>
                {lookupLoading && <ActivityIndicator color="white" size="large" />}
                <View style={[
                  styles.scanFrame,
                  { borderColor: opMode === 'inward' ? COLORS.secondary : COLORS.primary },
                ]} />
                <View style={styles.scanLabelBadge}>
                  <Ionicons
                    name={opMode === 'inward' ? 'arrow-down-circle' : 'create'}
                    size={14}
                    color="white"
                  />
                  <Text style={styles.scanLabelText}>
                    {opMode === 'inward' ? 'Scan to Add Stock' : 'Scan to Set Stock'}
                  </Text>
                </View>
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
          <View style={styles.searchContainer}>
            {/* Code input */}
            <View style={styles.codeRow}>
              <View style={styles.codeInputWrapper}>
                <Ionicons name="qr-code-outline" size={20} color={COLORS.textLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter SKU or GTIN..."
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

            <View style={styles.orRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or search by name</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.searchInputWrapper}>
              <Ionicons name="text-outline" size={20} color={COLORS.textLight} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by product name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Multi-variant picker after exact lookup */}
            {selectedProduct && !selectedVariant && selectedProduct.variants.length > 1 && (
              <View style={styles.productCard}>
                <Text style={styles.productName}>{selectedProduct.name}</Text>
                <Text style={styles.pickVariantHint}>Multiple variants — pick one:</Text>
                {selectedProduct.variants.map((v) => (
                  <VariantRow key={v._id} product={selectedProduct} variant={v} />
                ))}
              </View>
            )}

            {searchLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
            ) : (
              <FlatList
                data={searchData?.searchProducts?.items || []}
                keyExtractor={(item) => item._id}
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

      {/* ── Bottom Sheet ─────────────────────────────────────────────────── */}
      {selectedVariant && (
        <View style={styles.adjustmentSheet}>
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.sheetTitleRow}>
                <View style={[
                  styles.opBadge,
                  { backgroundColor: opMode === 'inward' ? COLORS.secondary : COLORS.primary },
                ]}>
                  <Ionicons
                    name={opMode === 'inward' ? 'arrow-down-circle' : 'create'}
                    size={12}
                    color="white"
                  />
                  <Text style={styles.opBadgeText}>
                    {opMode === 'inward' ? 'Add Stock' : 'Set Stock'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sheetTitle} numberOfLines={1}>{selectedProduct?.name}</Text>
              <Text style={styles.sheetSub}>SKU: {selectedVariant.sku}</Text>
              <Text style={styles.sheetStock}>
                Current: {selectedVariant.stockQuantity} units
                {'  ·  '}
                <Text style={{ color: statusColor(selectedVariant.availabilityStatus) }}>
                  {statusLabel(selectedVariant.availabilityStatus)}
                </Text>
              </Text>
            </View>
            <TouchableOpacity onPress={resetState}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Qty input */}
            <Text style={styles.fieldLabel}>
              {opMode === 'inward' ? 'Quantity to Add' : 'Set Total Stock To'}
            </Text>
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  setQuantity((prev) =>
                    // Add Stock minimum = 1 (can't add 0 units), Set Stock minimum = 0
                    String(Math.max(opMode === 'inward' ? 1 : 0, parseInt(prev || '0') - 1))
                  )
                }
              >
                <Ionicons name="remove" size={28} color={opMode === 'inward' ? COLORS.secondary : COLORS.primary} />
              </TouchableOpacity>
              <TextInput
                style={[styles.qtyInput, { color: opMode === 'inward' ? COLORS.secondary : COLORS.primary }]}
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((prev) => String(parseInt(prev || '0') + 1))}
              >
                <Ionicons name="add" size={28} color={opMode === 'inward' ? COLORS.secondary : COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Inward-only: vendor & PO ref fields */}
            {opMode === 'inward' && (
              <>
                <Text style={styles.fieldLabel}>Vendor / Supplier (optional)</Text>
                <View style={styles.fieldInputWrapper}>
                  <Ionicons name="business-outline" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. Supplier ABC"
                    value={vendor}
                    onChangeText={setVendor}
                  />
                </View>
                <Text style={styles.fieldLabel}>PO / GRN Reference (optional)</Text>
                <View style={styles.fieldInputWrapper}>
                  <Ionicons name="document-text-outline" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. PO-2024-001"
                    value={poRef}
                    onChangeText={setPoRef}
                    autoCapitalize="characters"
                  />
                </View>
              </>
            )}

            {/* Preview result */}
            {quantity !== '' && !isNaN(parseInt(quantity)) && (
              <View style={styles.previewBox}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.previewText}>
                  {opMode === 'inward'
                    ? `Stock will become: ${selectedVariant.stockQuantity} + ${parseInt(quantity) || 0} = ${selectedVariant.stockQuantity + (parseInt(quantity) || 0)}`
                    : `Stock will be set to: ${parseInt(quantity) || 0}`}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: opMode === 'inward' ? COLORS.secondary : COLORS.primary },
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? <ActivityIndicator color="white" />
                : <>
                  <Ionicons
                    name={opMode === 'inward' ? 'arrow-down-circle' : 'cloud-upload'}
                    size={20}
                    color="white"
                  />
                  <Text style={styles.submitBtnText}>
                    {opMode === 'inward' ? 'Add Stock' : 'Update Stock'}
                  </Text>
                </>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ── Image zoom modal ────────────────────────────────────────────── */}
      <Modal visible={!!zoomedImage} transparent animationType="fade">
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

  // Op mode bar
  opModeBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  opPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  opPillActive: { backgroundColor: COLORS.secondary },
  opPillSetActive: { backgroundColor: COLORS.primary },
  opPillText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  opPillTextActive: { color: 'white' },

  // Scan / Search tabs
  headerTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },

  content: { flex: 1 },

  // Camera
  scanFrameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  scanFrame: { width: 260, height: 160, borderWidth: 2.5, borderRadius: 12 },
  scanLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scanLabelText: { color: 'white', fontSize: 13, fontWeight: '600' },

  // Manual search
  searchContainer: { flex: 1, padding: 15 },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  codeInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 50,
  },
  codeInput: { flex: 1, fontSize: 15, color: COLORS.textDark },
  lookupBtn: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  orText: { color: COLORS.textLight, fontSize: 12, fontWeight: '500' },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 50,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textDark },
  pickVariantHint: { fontSize: 12, color: COLORS.textLight, marginBottom: 6 },
  listContent: { paddingBottom: 200 },
  emptyText: { textAlign: 'center', marginTop: 30, color: COLORS.textLight, fontSize: 14 },

  // Product / variant cards
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  productName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  selectedVariantRow: { backgroundColor: '#f0f9ff', borderRadius: 8, paddingHorizontal: 8 },
  variantImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#f1f5f9' },
  placeholderImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#f1f5f9' },
  variantInfo: { flex: 1 },
  variantSku: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  variantGtin: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  variantStockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  variantStock: { fontSize: 12, fontWeight: 'bold', color: COLORS.textDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },

  // Bottom sheet
  adjustmentSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '75%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  sheetHeader: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  opBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  opBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  sheetTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textDark },
  sheetSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  sheetStock: { fontSize: 12, color: COLORS.textDark, fontWeight: '500', marginTop: 4 },

  // Fields
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 46,
  },
  fieldInput: { flex: 1, fontSize: 14, color: COLORS.textDark },

  // Qty
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  qtyBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInput: { fontSize: 40, fontWeight: 'bold', minWidth: 90, textAlign: 'center' },

  // Preview
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  previewText: { fontSize: 13, color: COLORS.primary, fontWeight: '500', flex: 1 },

  // Submit
  submitBtn: {
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Permissions
  noPerm: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permBtnText: { color: 'white', fontWeight: 'bold' },

  // Zoom modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalCloseArea: { ...StyleSheet.absoluteFillObject },
  modalContent: { width: '90%', height: '70%', justifyContent: 'center', alignItems: 'center' },
  zoomedImage: { width: '100%', height: '100%', borderRadius: 12 },
  closeZoomBtn: { position: 'absolute', top: -40, right: 0, padding: 8 },
});

export default InventoryScreen;
