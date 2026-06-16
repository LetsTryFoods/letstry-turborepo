import { useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { START_PACKING } from '../graphql/queries';
import { getCdnUrl, API_URL } from '../config/api';
import ImageZoomModal from '../components/ImageZoomModal';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { order, user } = route.params;
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isDownloadingCustom, setIsDownloadingCustom] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloadingInvoice(true);
      const restApiUrl = API_URL.replace('/graphql', '');
      const downloadUrl = `${restApiUrl}/orders/${order.orderId || order.id}/invoice`;
      await Linking.openURL(downloadUrl);
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to open invoice URL');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const handleDownloadCustomLabel = async () => {
    try {
      setIsDownloadingCustom(true);
      const restApiUrl = API_URL.replace('/graphql', '');
      const downloadUrl = `${restApiUrl}/orders/${order.orderId || order.id}/custom-label`;
      await Linking.openURL(downloadUrl);
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to download custom label');
    } finally {
      setIsDownloadingCustom(false);
    }
  };

  const [startPacking, { loading }] = useMutation(START_PACKING, {
    onCompleted: () => {
      navigation.navigate('CameraVerification', {
        orderId: order.id,
        order: order,
        user: user,
      });
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to start packing');
    },
  });

  const handleStartPacking = () => {
    if (!order?.id) {
      Alert.alert('System Error', 'Order ID is missing.');
      return;
    }
    startPacking({ variables: { packingOrderId: order.id } });
  };

  const renderItem = ({ item }) => {
    const imageUrl = getCdnUrl(item.imageUrl) || 'https://placehold.co/60x60/e2e8f0/64748b?text=IMG';

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImage({ url: imageUrl, name: item.name });
            setZoomModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
            />
            <View style={styles.imageZoomOverlay}>
              <Ionicons name="search" size={18} color={COLORS.white} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.itemInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.sku}>SKU: {item.sku}</Text>
          <Text style={styles.ean}>EAN: {item.ean}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
            <Text style={styles.qty}>Qty: {item.quantity}</Text>
            {item.dimensions?.weight ? (
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                {item.dimensions.weight}{item.dimensions.unit}
              </Text>
            ) : null}
            {item.unitPrice ? (
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                ₹{item.unitPrice}
              </Text>
            ) : null}
          </View>
        </View>
        {item.isFragile && <Ionicons name="wine" size={20} color={COLORS.danger} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.status}>Status: {order.status}</Text>
        <Text style={styles.sub}>Assigned to: {order.packerName || user.name}</Text>
        {order.specialInstructions ? (
          <Text style={styles.instructions}>⚠ {order.specialInstructions}</Text>
        ) : null}
      </View>

      <View style={styles.downloadActions}>
        <TouchableOpacity 
          style={styles.downloadBtn} 
          onPress={handleDownloadInvoice}
          disabled={isDownloadingInvoice}
        >
          {isDownloadingInvoice ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="document-text" size={16} color={COLORS.primary} />}
          <Text style={styles.downloadBtnText}>Invoice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.downloadBtn} 
          onPress={handleDownloadCustomLabel}
          disabled={isDownloadingCustom}
        >
          {isDownloadingCustom ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="barcode" size={16} color={COLORS.primary} />}
          <Text style={styles.downloadBtnText}>Custom Label</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={order.items}
        keyExtractor={(item) => item.productId || item.sku}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Items to Pack</Text>}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleStartPacking} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.btnText}>Start Packing</Text>
              <Ionicons name="cube-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <ImageZoomModal
        visible={zoomModalVisible}
        imageUrl={selectedImage?.url}
        title={selectedImage?.name}
        onClose={() => setZoomModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  infoBox: { paddingHorizontal: 16, marginBottom: 10 },
  status: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  sub: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  instructions: { marginTop: 6, color: '#f59e0b', fontSize: 12 },
  downloadActions: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 12 },
  downloadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', paddingVertical: 10, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  downloadBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, marginVertical: 12, color: COLORS.textDark },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 14, alignItems: 'center', elevation: 2 },
  imageWrapper: { position: 'relative' },
  productImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  imageZoomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  sku: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  ean: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  qty: { fontSize: 12, marginTop: 4, fontWeight: 'bold', color: COLORS.textDark },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  primaryBtn: { height: 54, backgroundColor: COLORS.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default OrderDetailsScreen;
