




import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity, FlatList, ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackOrder } from '../services/OrderService';
import { fetchFoodDetails } from '../services/FoodService';
import { useAuth } from '../context/AuthContext';
import { getUserFriendlyStatus } from '../constants/shipmentStatusMap';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

// Gradient Header Component
const GradientHeader = ({ title, onBack, insets }) => (
  <LinearGradient
    colors={['#F2D377', '#F5F5F5']}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={headerStyles.gradient}
  >
    <View style={{ paddingTop: insets.top }}>
      <View style={headerStyles.headerContent}>
        <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
          <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
        </TouchableOpacity>
        <Text
          style={headerStyles.title}
          allowFontScaling={false}
          adjustsFontSizeToFit
        >
          {title}
        </Text>
        <View style={headerStyles.iconPlaceholder} />
      </View>
    </View>
  </LinearGradient>
);


// Main Screen Component
const OrderDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { idToken } = useAuth();
  const { order: initialOrder } = route.params;

  const [updatedOrder, setUpdatedOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchLatestStatus = async () => {
      if (!initialOrder.orderId) {
        setLoading(false);
        return;
      }
      try {
        const trackingData = await trackOrder(initialOrder.orderId, idToken);
        const latestStatusCode = trackingData?.tracking_data?.shipment_status || initialOrder.statusCode;
        setUpdatedOrder({ ...initialOrder, statusCode: latestStatusCode });
      } catch (error) {
        console.error("Failed to fetch order status:", error);
        setUpdatedOrder(initialOrder);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestStatus();
  }, [initialOrder.orderId, idToken]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const promises = (initialOrder.items || []).map(item =>
          item.foodId ? fetchFoodDetails(item.foodId) : Promise.resolve(null)
        );
        const details = await Promise.all(promises);
        setProductImages(details.map(d => d?.imageUrl || null));
      } catch {
        setProductImages([]);
      }
    };
    loadImages();
  }, [initialOrder]);
  
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const statusText = getUserFriendlyStatus(updatedOrder.statusCode);
  const isCancelled = statusText === 'Cancelled';

  const renderProduct = ({ item, index }) => (
    <View style={styles.productRow}>
      <View style={styles.imageContainer}>
        {productImages[index] && (
          <Image
            source={{ uri: productImages[index] }}
            style={styles.productImage}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productMeta}>
          Qty: {item.quantity}  |  ₹{item.price}
        </Text>
      </View>
    </View>
  );

  const getLabelIcon = (label) => {
    const lower = (label || "").toLowerCase();
    if (lower.includes("home")) return require("../assets/icons/home.png");
    if (lower.includes("office") || lower.includes("work")) return require("../assets/icons/office.png");
    if (lower.includes("flat")) return require("../assets/icons/flat.png");
    return require("../assets/icons/other.png");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
  //       <ActivityIndicator size="large" color="#0C5273" />
  //       <Text style={{ marginTop: 10, color: '#555' }}>Fetching latest status...</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <GradientHeader
        title="Order Details"
        onBack={() => navigation.goBack()}
        insets={insets}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <TouchableOpacity 
          style={styles.idBox} 
          onPress={() => copyToClipboard(updatedOrder.orderId || updatedOrder._id)}
          activeOpacity={0.7}
        >
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID - </Text>
            <Text style={styles.orderIdValue} numberOfLines={1} ellipsizeMode='middle'>
              {updatedOrder.orderId || updatedOrder._id}
            </Text>
          </View>
          
          {isCopied ? (
            <Text style={styles.copiedText}>Copied!</Text>
          ) : (
            <Ionicons name="copy-outline" size={RFValue(14)} color="#555" />
          )}
        </TouchableOpacity>
        <View style={[styles.statusBox, isCancelled && styles.cancelledStatusBox]}>
          <Text style={[styles.statusTitle, isCancelled && styles.cancelledStatusTitle]}>
            {statusText}
          </Text>
          <Text style={[styles.statusDesc, isCancelled && styles.cancelledStatusDesc]}>
            {isCancelled 
              ? `This order was cancelled.`
              : `Your order was placed on ${formatDate(updatedOrder.createdAt)}.`
            }
          </Text>
        </View>
        <View style={styles.card}>
          <FlatList
            data={updatedOrder.items || []}
            renderItem={renderProduct}
            keyExtractor={(item, idx) => item.foodId || idx.toString()}
            ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <View style={styles.labelRow}>
            <Image
              source={getLabelIcon(updatedOrder.address?.label)}
              style={styles.labelIcon}
              resizeMode="contain"
            />
            <Text style={styles.deliveryAddressLabel}>
              {updatedOrder.address?.label
                ? updatedOrder.address.label.charAt(0).toUpperCase() + updatedOrder.address.label.slice(1)
                : "Home"}
            </Text>
          </View>
          <Text style={styles.deliveryAddress2}>
            {updatedOrder.address?.buildingName} {updatedOrder.address?.street}, {updatedOrder.address?.city}, {updatedOrder.address?.state} - {updatedOrder.address?.pincode}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const headerStyles = StyleSheet.create({
  gradient: { 
    paddingBottom: hp(1.5)
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
  },
  iconButton: { 
    padding: wp(2)
  },
  iconPlaceholder: { 
    width: RFValue(22) + wp(4)
  },
  title: {
    flex: 1,
    fontWeight: "bold",
    fontSize: RFValue(14),
    color: "#222",
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  idBox: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderIdContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: wp(2),
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: RFValue(11.5),
    color: '#666',
    fontWeight: '600',
  },
  orderIdValue: {
    fontSize: RFValue(11.5),
    color: '#666',
    flex: 1,
  },
  copiedText: {
    fontSize: RFValue(11.5),
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 1,
  },
  cardTitle: { 
    fontSize: RFValue(15), 
    fontWeight: '700', 
    marginBottom: hp(1), 
    color: '#111' 
  },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  imageContainer: {
    width: wp(13), 
    height: wp(13), 
    borderRadius: wp(2.5), 
    backgroundColor: '#f1f5f9',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  productImage: { 
    width: wp(12), 
    height: wp(12), 
    borderRadius: wp(2) 
  },
  productName: { 
    fontSize: RFValue(14), 
    fontWeight: '600', 
    color: '#222' 
  },
  productMeta: { 
    fontSize: RFValue(12), 
    color: '#555', 
    marginTop: hp(0.5) 
  },
  itemDivider: { 
    height: 1, 
    backgroundColor: '#eee', 
    marginVertical: hp(1) 
  },
  statusBox: {
    borderRadius: wp(2.5), 
    marginHorizontal: wp(4),
    marginBottom: hp(2), 
    padding: wp(4),
  },
  statusTitle: { 
    fontSize: RFValue(15), 
    fontWeight: '700', 
    marginBottom: hp(0.5) 
  },
  statusDesc: { 
    fontSize: RFValue(13), 
    fontWeight: "400" 
  },
  cancelledStatusBox: { backgroundColor: '#FEF2F2' },
  cancelledStatusTitle: { color: '#B91C1C' },
  cancelledStatusDesc: { color: '#7F1D1D' },
  deliveryAddress2: { fontSize: RFValue(13), color: "#555" },
  labelRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: hp(0.5) 
  },
  labelIcon: { 
    width: wp(6), 
    height: wp(6), 
    marginRight: wp(2) 
  },
  deliveryAddressLabel: { 
    fontSize: RFValue(14), 
    fontWeight: "700", 
    color: "#222" 
  },
});

export default OrderDetailsScreen;


