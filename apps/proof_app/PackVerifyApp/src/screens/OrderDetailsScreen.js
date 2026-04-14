



// import { useMutation } from '@apollo/client';
// import { Ionicons } from '@expo/vector-icons';
// import { useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { COLORS } from '../constants/theme';
// import { START_PACKING } from '../graphql/queries';

// const OrderDetailsScreen = ({ route, navigation }) => {
//   // ✅ REQUIRED PARAMS (GUARANTEED)
//   const { order, user } = route.params;

//   const [localOrder, setLocalOrder] = useState(order);

//   // ✅ START PACKING
//   const [startPacking, { loading }] = useMutation(START_PACKING, {
//     onCompleted: () => {
//       // move to camera with FULL DATA
//       navigation.navigate('CameraVerification', {
//   orderId: order.id,
//   order: order, // FULL ORDER WITH ITEMS
//   user: user,
// });


//     },
//     onError: (err) => {
//       Alert.alert('Error', err.message);
//     },
//   });

//   const handleStartPacking = () => {
//     startPacking({
//       variables: {
//         packingOrderId: order.id,
//       },
//     });
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.itemCard}>
//       <Image
//         source={{ uri: item.imageUrl }}
//         style={styles.productImage}
//       />

//       <View style={styles.itemInfo}>
//         <Text style={styles.productName}>{item.name}</Text>
//         <Text style={styles.sku}>SKU: {item.sku}</Text>
//         <Text style={styles.ean}>EAN: {item.ean}</Text>
//         <Text style={styles.qty}>Qty: {item.quantity}</Text>
//       </View>

//       {item.isFragile && (
//         <Ionicons name="warning" size={20} color={COLORS.warning} />
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>
//           Order #{order.orderNumber}
//         </Text>

//         <View style={{ width: 24 }} />
//       </View>

//       {/* ORDER INFO */}
//       <View style={styles.infoBox}>
//         <Text style={styles.status}>Status: {order.status}</Text>
//         <Text style={styles.sub}>
//           Assigned to: {order.packerName || user.name}
//         </Text>

//         {order.specialInstructions ? (
//           <Text style={styles.instructions}>
//             ⚠ {order.specialInstructions}
//           </Text>
//         ) : null}
//       </View>

//       {/* ITEMS */}
//       <FlatList
//         data={order.items}
//         keyExtractor={(item) => item.productId}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 120 }}
//         ListHeaderComponent={
//           <Text style={styles.sectionTitle}>Items to Pack</Text>
//         }
//       />

//       {/* FOOTER BUTTON */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={styles.primaryBtn}
//           onPress={handleStartPacking}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <>
//               <Text style={styles.btnText}>Start Packing</Text>
//               <Ionicons
//                 name="play"
//                 size={18}
//                 color="#fff"
//                 style={{ marginLeft: 8 }}
//               />
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default OrderDetailsScreen;

// /* ===================== STYLES ===================== */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.textDark,
//   },

//   infoBox: {
//     paddingHorizontal: 16,
//     marginBottom: 10,
//   },

//   status: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//   },

//   sub: {
//     fontSize: 12,
//     color: COLORS.textLight,
//     marginTop: 4,
//   },

//   instructions: {
//     marginTop: 6,
//     color: COLORS.warning,
//     fontSize: 12,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     paddingHorizontal: 16,
//     marginVertical: 12,
//     color: COLORS.textDark,
//   },

//   itemCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginBottom: 12,
//     padding: 12,
//     borderRadius: 14,
//     alignItems: 'center',
//     elevation: 2,
//   },

//   productImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     backgroundColor: '#eee',
//   },

//   itemInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   productName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.textDark,
//   },

//   sku: {
//     fontSize: 12,
//     color: COLORS.textLight,
//     marginTop: 2,
//   },

//   ean: {
//     fontSize: 11,
//     color: COLORS.textLight,
//     marginTop: 2,
//   },

//   qty: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: 'bold',
//   },

//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },

//   primaryBtn: {
//     height: 54,
//     backgroundColor: COLORS.primary,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },

//   btnText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });















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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { START_PACKING } from '../graphql/queries';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { order, user } = route.params;

  // ✅ START PACKING MUTATION
  const [startPacking, { loading }] = useMutation(START_PACKING, {
    onCompleted: (data) => {
      // ✅ SUCCESS: Move to Camera with FULL Data
      navigation.navigate('CameraVerification', {
        orderId: order.id,
        order: order,
        user: user,
      });
    },
    onError: (err) => {
      Alert.alert('Error', err.message || "Failed to start packing");
    },
  });

  const handleStartPacking = () => {
    if (!order?.id) {
        Alert.alert("System Error", "Order ID is missing.");
        return;
    }
    startPacking({
      variables: { packingOrderId: order.id },
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/60' }} style={styles.productImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.sku}>SKU: {item.sku}</Text>
        <Text style={styles.qty}>Qty: {item.quantity}</Text>
      </View>
      {item.isFragile && <Ionicons name="wine" size={20} color={COLORS.warning} />}
    </View>
  );

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
        {order.specialInstructions && (
          <Text style={styles.instructions}>⚠ {order.specialInstructions}</Text>
        )}
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
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.btnText}>Start Packing</Text>
              <Ionicons name="cube-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  instructions: { marginTop: 6, color: COLORS.warning, fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, marginVertical: 12, color: COLORS.textDark },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 14, alignItems: 'center', elevation: 2 },
  productImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  itemInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  sku: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  qty: { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  primaryBtn: { height: 54, backgroundColor: COLORS.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default OrderDetailsScreen;