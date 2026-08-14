import { Ionicons } from '@expo/vector-icons';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import {
  CREATE_MANUAL_PACK,
  GET_ACTIVE_BOX_SIZES,
  SEARCH_PRODUCTS_FOR_MANUAL_PACK,
} from '../graphql/queries';

const ManualPackScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  const insets = useSafeAreaInsets();

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [note, setNote] = useState('');

  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [showBoxModal, setShowBoxModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const searchDebounceRef = useRef(null);

  const { data: boxesData } = useQuery(GET_ACTIVE_BOX_SIZES, {
    fetchPolicy: 'cache-first',
  });
  const activeBoxes = boxesData?.getActiveBoxSizes || [];

  const [searchProducts, { loading: searchLoading }] = useLazyQuery(
    SEARCH_PRODUCTS_FOR_MANUAL_PACK,
    {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        setSearchResults(data?.searchProducts?.items || []);
      },
      onError: () => setSearchResults([]),
    },
  );

  // Debounced auto-search: fires 400ms after the user stops typing.
  // Clearing the input clears the results immediately without a request.
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      searchProducts({ variables: { searchTerm: term } });
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm]);

  const [createManualPack] = useMutation(CREATE_MANUAL_PACK, {
    onCompleted: (data) => {
      Alert.alert(
        'Pack Recorded',
        `Manual pack #${data?.createManualPack?.orderNumber} recorded successfully.`,
        [
          {
            text: 'Back to Dashboard',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ],
      );
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to record manual pack');
    },
  });

  const addItem = (variant, product) => {
    const existing = selectedItems.find((i) => i.variantId === variant._id);
    if (existing) {
      setSelectedItems((prev) =>
        prev.map((i) =>
          i.variantId === variant._id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
      return;
    }
    setSelectedItems((prev) => [
      ...prev,
      {
        variantId: variant._id,
        sku: variant.sku,
        name: product.name,
        mrp: variant.mrp,
        quantity: 1,
      },
    ]);
  };

  const changeQuantity = (variantId, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((i) =>
          i.variantId === variantId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const validate = () => {
    if (!senderName.trim()) return 'Sender name is required';
    if (!recipientName.trim()) return 'Recipient name is required';
    if (!recipientPhone.trim()) return 'Recipient phone is required';
    if (!addressLine1.trim()) return 'Address line 1 is required';
    if (!city.trim()) return 'City is required';
    if (!state.trim()) return 'State is required';
    if (!pincode.trim()) return 'Pincode is required';
    if (!selectedBoxId) return 'Please select a box';
    if (selectedItems.length === 0) return 'Add at least one item';
    return null;
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing Info', error);
      return;
    }
    setSubmitting(true);
    createManualPack({
      variables: {
        input: {
          senderName: senderName.trim(),
          senderPhone: senderPhone.trim() || undefined,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          boxId: selectedBoxId,
          note: note.trim() || undefined,
          items: selectedItems.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        },
      },
    }).finally(() => setSubmitting(false));
  };

  const selectedBox = activeBoxes.find((b) => b.id === selectedBoxId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Pack</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? insets.top + 50 : 0
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.sectionTitle}>Sender</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Sender Name *</Text>
          <TextInput
            style={styles.input}
            value={senderName}
            onChangeText={setSenderName}
            placeholder="e.g. Marketing Team"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Sender Phone</Text>
          <TextInput
            style={styles.input}
            value={senderPhone}
            onChangeText={setSenderPhone}
            placeholder="Optional"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Recipient</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={recipientName}
            onChangeText={setRecipientName}
            placeholder="Recipient name"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={recipientPhone}
            onChangeText={setRecipientPhone}
            placeholder="Recipient phone"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput
            style={styles.input}
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="House/street"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            style={styles.input}
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Landmark (optional)"
            placeholderTextColor="#94a3b8"
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={setPincode}
            placeholder="Pincode"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <Text style={styles.sectionTitle}>Box</Text>
        <TouchableOpacity style={styles.card} onPress={() => setShowBoxModal(true)}>
          <View style={styles.boxRow}>
            <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
            <Text style={styles.boxText}>
              {selectedBox ? selectedBox.name : 'Select box or packet'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.card}>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Type to search products..."
              placeholderTextColor="#94a3b8"
              autoCorrect={false}
            />
            {searchLoading && (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}
          </View>

          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(p) => p._id}
              style={{ marginTop: 10 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: product }) => (
                <View style={styles.productBlock}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.variants
                    ?.filter((v) => v.availabilityStatus === 'in_stock')
                    .map((variant) => (
                      <TouchableOpacity
                        key={variant._id}
                        style={styles.variantRow}
                        onPress={() => addItem(variant, product)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.variantName}>
                            {variant.name || variant.sku}
                          </Text>
                          <Text style={styles.variantMeta}>
                            {variant.sku} · ₹{variant.mrp} · Stock{' '}
                            {variant.stockQuantity}
                          </Text>
                        </View>
                        <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            />
          )}
        </View>

        {selectedItems.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>Selected Items</Text>
            {selectedItems.map((item) => (
              <View key={item.variantId} style={styles.selectedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedName}>{item.name}</Text>
                  <Text style={styles.selectedMeta}>{item.sku}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => changeQuantity(item.variantId, -1)}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="remove" size={18} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => changeQuantity(item.variantId, 1)}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="add" size={18} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Note</Text>
        <View style={styles.card}>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            value={note}
            onChangeText={setNote}
            placeholder="Optional note (e.g. influencer tasting)"
            placeholderTextColor="#94a3b8"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>Record Pack</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showBoxModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Box / Packet</Text>
            <FlatList
              data={activeBoxes}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.boxOption,
                    selectedBoxId === item.id && styles.boxOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedBoxId(item.id);
                    setShowBoxModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.boxOptionText,
                      selectedBoxId === item.id && styles.boxOptionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.lengthInches ? (
                    <Text style={styles.boxDim}>
                      {item.lengthInches}x{item.breadthInches}x{item.heightInches} in
                    </Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowBoxModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  row: { flexDirection: 'row' },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  boxText: { flex: 1, fontSize: 15, color: COLORS.textDark, fontWeight: '500' },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  productBlock: { marginBottom: 10 },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 4,
  },
  variantName: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  variantMeta: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  selectedMeta: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
    width: 32,
    textAlign: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 54,
    marginTop: 20,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  boxOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  boxOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#eef2ff',
  },
  boxOptionText: { fontSize: 15, fontWeight: '500', color: COLORS.textDark },
  boxOptionTextSelected: { color: COLORS.primary, fontWeight: 'bold' },
  boxDim: { fontSize: 12, color: COLORS.textLight },
  cancelBtn: {
    padding: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: { color: COLORS.textDark, fontWeight: '600' },
});

export default ManualPackScreen;
