
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Alert,
  StatusBar,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { fetchMyOrders, trackOrder } from "../services/OrderService";
import { useAuth } from "../context/AuthContext";
import OrderCard from "../components/OrderCard";
import ShimmerLoader from "../components/OrderScreenShimmer";
import { fetchFoodDetails } from "../services/FoodService";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import TrackOrderModal from "../components/TrackOrderModal";

const GradientHeader = ({ title, onBack, insets }) => (
  <LinearGradient
    colors={["#F2D377", "#F5F5F5"]}
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
          allowFontScaling={false}
          adjustsFontSizeToFit
          style={headerStyles.title}
        >
          {title}
        </Text>
        <View style={headerStyles.iconPlaceholder} />
      </View>
    </View>
  </LinearGradient>
);

const headerStyles = StyleSheet.create({
  gradient: {
    paddingBottom: hp(1.5),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
  },
  iconButton: {
    padding: wp(2),
  },
  iconPlaceholder: {
    width: wp(8),
    height: wp(8),
  },
  title: {
    flex: 1,
    color: "#222",
    fontSize: RFValue(14),
    fontWeight: "bold",
    textAlign: "center",
  },
});

const MyOrdersScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { idToken } = useAuth();
  const [detailedOrders, setDetailedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [trackActivities, setTrackActivities] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadCompleteOrders();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCompleteOrders = async () => {
    try {
      setLoading(true);
      const ordersResp = await fetchMyOrders(idToken);
      const orders = Array.isArray(ordersResp) ? ordersResp : [];

      const detailedPromises = orders.map(async (order) => {
        const imgPromises = (order.items || []).map((item) =>
          item.foodId ? fetchFoodDetails(item.foodId) : Promise.resolve(null)
        );
        const foodDetailsArr = await Promise.all(imgPromises);
        const productImages = foodDetailsArr
          .filter((d) => d?.imageUrl)
          .map((d) => d.imageUrl);

        let statusCode = 1;
        let deliveredDate = order.deliveryDate || null;
        let trackingData = null;

        try {
          const trackResp = await trackOrder(order.orderId, idToken);
          trackingData = trackResp;
          if (trackResp?.tracking_data?.shipment_status) {
            statusCode = trackResp.tracking_data.shipment_status;
            deliveredDate =
              trackResp?.tracking_data?.shipment_track?.[0]?.delivered_date ||
              order.deliveryDate ||
              null;
          }
        } catch (error) {
          console.warn(
            `Could not fetch tracking for order ${order.orderId}. Defaulting status to 'Placed'.`,
            error.message
          );
        }
        
        // --- NEW ---
        // Create a boolean flag to easily check if the order is trackable
        const activities =
          trackingData?.tracking_data?.shipment_track_activities || [];
        const isTrackable = activities.length > 0;

        return {
          ...order,
          productImages,
          statusCode,
          deliveredDate,
          trackingData, // Pass the full data for the modal
          isTrackable, // Pass the boolean flag to the OrderCard
        };
      });

      const detailedOrdersArr = await Promise.all(detailedPromises);
      setDetailedOrders(
        detailedOrdersArr.sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to load orders");
      console.error("loadCompleteOrders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = (order) => {
    // This function is now only called for orders that are trackable
    const activities =
      order?.trackingData?.tracking_data?.shipment_track_activities || [];
    setTrackActivities(activities);
    setTrackModalVisible(true);
  };

  const handleViewDetails = (order) => {
    navigation.navigate("OrderDetailsScreen", { order });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <GradientHeader
        title="My Orders"
        onBack={() => navigation.goBack()}
        insets={insets}
      />

      {loading ? (
        <ShimmerLoader />
      ) : (
        <FlatList
          data={detailedOrders}
          keyExtractor={(item) => item.orderId || item._id.toString()}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onTrackOrder={() => handleTrackOrder(item)}
              onViewDetails={() => handleViewDetails(item)}
            />
          )}
          refreshing={loading}
          onRefresh={loadCompleteOrders}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: hp(20),
              }}
            >
              <Text style={{ fontSize: RFValue(16), color: "#888" }}>
                No orders found.
              </Text>
            </View>
          }
        />
      )}

      <TrackOrderModal
        visible={trackModalVisible}
        onClose={() => setTrackModalVisible(false)}
        activities={trackActivities}
      />
    </View>
  );
};

export default MyOrdersScreen;





