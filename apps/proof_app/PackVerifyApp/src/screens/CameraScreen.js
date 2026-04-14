


// import { Ionicons } from '@expo/vector-icons';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as FileSystem from 'expo-file-system';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as MediaLibrary from 'expo-media-library';
// import { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   Vibration,
//   View
// } from 'react-native';
// import ViewShot from 'react-native-view-shot';
// import { COLORS } from '../constants/theme';

// import { useMutation } from '@apollo/client';
// import { COMPLETE_PACKING, SCAN_ITEM, UPLOAD_EVIDENCE } from '../graphql/queries';


// /* ======================================================
// PHOTO STEPS
// ====================================================== */
// const PHOTO_STEPS = [
//   { id: 'inner', group: 'PRE', label: 'STEP 1 / 3', desc: 'Capture items inside box' },
//   { id: 'protective', group: 'PRE', label: 'STEP 2 / 3', desc: 'Capture protective packaging' },
//   { id: 'label', group: 'POST', label: 'STEP 3 / 3', desc: 'Capture sealed box & label' },
// ];


// /* ======================================================
// COMPONENT
// ====================================================== */
// const CameraScreen = ({ navigation, route }) => {
//   const { order, user } = route.params;

//   const cameraRef = useRef(null);
//   const viewShotRef = useRef(null);

//   const [permission, requestPermission] = useCameraPermissions();
//   const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

//   /* ===============================
//      PACKING STATE
//   =============================== */
//   const [items, setItems] = useState(
//     order.items.map(i => ({
//       ...i,
//       scannedQty: i.scannedCount || 0
//     }))
//   );

//   const [scanLocked, setScanLocked] = useState(false);
//   const [packingDone, setPackingDone] = useState(false);

//   /* ===============================
//      DEBUG STATE
//   =============================== */
//   const [lastScannedEAN, setLastScannedEAN] = useState(null);
//   const [lastScanResult, setLastScanResult] = useState(null);

//   /* ===============================
//      PHOTO STATE
//   =============================== */
//   const [currentStepIndex, setCurrentStepIndex] = useState(0);
//   const [currentPhoto, setCurrentPhoto] = useState(null);
//   const [evidencePaths, setEvidencePaths] = useState({ pre: [], post: [] });
//   const [isProcessing, setIsProcessing] = useState(false);

//   const currentStep = PHOTO_STEPS[currentStepIndex];

//   /* ===============================
//      GRAPHQL
//   =============================== */
//   const [scanItemMutation] = useMutation(SCAN_ITEM);
//   const [uploadEvidenceMutation] = useMutation(UPLOAD_EVIDENCE);
//   const [completePackingMutation] = useMutation(COMPLETE_PACKING);

//   useEffect(() => {
//     if (!permission?.granted) requestPermission();
//     if (!mediaPermission?.granted) requestMediaPermission();
//   }, []);


//   /* ======================================================
//      SCAN HANDLER
//   ====================================================== */
//   const handleBarcodeScan = async ({ data }) => {
//     if (scanLocked) return;
//     setScanLocked(true);
//     setLastScannedEAN(data);

//     try {
//       const variables = {
//         input: {
//           packingOrderId: order.id,
//           ean: data
//         }
//       };

//       console.log("📤 SCAN REQUEST", variables);

//       const response = await scanItemMutation({
//         variables,
//         errorPolicy: 'all'
//       });

//       console.log("📥 SCAN RESPONSE", response);

//       if (response.errors?.length) {
//         Vibration.vibrate();
//         Alert.alert("Scan Error", response.errors[0].message);
//         return;
//       }

//       const log = response?.data?.scanItem;
//       setLastScanResult(log);   // ⭐ store backend result

//       if (!log) {
//         Alert.alert("Scan Failed", "No result returned");
//         return;
//       }

//       if (!log.isValid) {
//         Vibration.vibrate();
//         Alert.alert("Invalid Item", log.errorType || "Unknown error");
//         return;
//       }

//       setItems(prev => {
//         const updated = [...prev];
//         const index = updated.findIndex(i => i.productId === log.matchedProductId);
//         if (index !== -1) updated[index].scannedQty = log.scannedQuantity;
//         return updated;
//       });

//     } catch (err) {
//       console.log("NETWORK ERROR", err);
//       Alert.alert("Network Error", err.message);
//     } finally {
//       setTimeout(() => setScanLocked(false), 800);
//     }
//   };


//   /* ======================================================
//      CHECK COMPLETE
//   ====================================================== */
//   useEffect(() => {
//     const done = items.every(i => i.scannedQty >= i.quantity);
//     if (done && !packingDone) {
//       setPackingDone(true);
//       Alert.alert("Scanning Complete");
//     }
//   }, [items]);


//   /* ======================================================
//      CAMERA CAPTURE
//   ====================================================== */
//   const takePicture = async () => {
//     if (!cameraRef.current) return;
//     const data = await cameraRef.current.takePictureAsync({ quality: 0.6 });
//     setCurrentPhoto(data.uri);
//   };


//   /* ======================================================
//      PHOTO FLOW
//   ====================================================== */
//   const confirmAndNext = async () => {
//     setIsProcessing(true);
//     try {
//       const uri = await viewShotRef.current.capture();
//       const newPaths = { ...evidencePaths };

//       if (currentStep.group === 'PRE') newPaths.pre.push(uri);
//       else newPaths.post.push(uri);

//       setEvidencePaths(newPaths);

//       if (currentStepIndex < PHOTO_STEPS.length - 1) {
//         setCurrentPhoto(null);
//         setCurrentStepIndex(i => i + 1);
//         setIsProcessing(false);
//       } else {
//         await finalSubmission(newPaths);
//       }
//     } catch {
//       Alert.alert("Photo processing failed");
//       setIsProcessing(false);
//     }
//   };


//   /* ======================================================
//      FINAL SUBMIT
//   ====================================================== */
//   const finalSubmission = async (paths) => {
//     try {
//       const preImages = await Promise.all(
//         paths.pre.map(uri => FileSystem.readAsStringAsync(uri, { encoding: 'base64' }))
//       );

//       const postImages = await Promise.all(
//         paths.post.map(uri => FileSystem.readAsStringAsync(uri, { encoding: 'base64' }))
//       );

//       await uploadEvidenceMutation({
//         variables: {
//           input: {
//             packingOrderId: order.id,
//             prePackImages: preImages,
//             postPackImages: postImages,
//             actualBoxCode: null
//           }
//         }
//       });

//       await completePackingMutation({
//         variables: { packingOrderId: order.id }
//       });

//       Alert.alert("SUCCESS", "Order packed", [
//         { text: "Dashboard", onPress: () => navigation.navigate('Dashboard') }
//       ]);

//     } catch (err) {
//       Alert.alert("Submission Error", err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };


//   /* ======================================================
//      PHOTO PREVIEW
//   ====================================================== */
//   if (currentPhoto) {
//     return (
//       <View style={styles.container}>
//         <StatusBar hidden />
//         <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
//           <Image source={{ uri: currentPhoto }} style={{ flex: 1 }} />
//           <LinearGradient colors={['transparent','rgba(0,0,0,0.8)']} style={styles.watermarkGradient}>
//             <Text style={styles.wmTitle}>PACKED BY {user.name}</Text>
//             <Text style={styles.wmSub}>{currentStep.desc}</Text>
//           </LinearGradient>
//         </ViewShot>

//         <View style={styles.actionOverlay}>
//           <TouchableOpacity onPress={() => setCurrentPhoto(null)} style={styles.btnBlur}>
//             <Ionicons name="refresh" size={24} color="#fff"/>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={confirmAndNext} style={styles.btnPrimary}>
//             {isProcessing ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>NEXT</Text>}
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }


//   /* ======================================================
//      SCANNER UI WITH FULL DEBUG
//   ====================================================== */
//   if (!packingDone) {
//     return (
//       <View style={styles.container}>
//         <StatusBar hidden />
//         <CameraView
//           style={{ flex: 1 }}
//           ref={cameraRef}
//           barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','qr'] }}
//           onBarcodeScanned={handleBarcodeScan}
//         >
//           <View style={styles.scanOverlay}>

//             <View style={styles.debugBox}>
//               <Text style={styles.debugTitle}>DEBUG INFO</Text>

//               <Text style={styles.debugText}>
//                 Camera scanned: {lastScannedEAN || "None"}
//               </Text>

//               {lastScanResult && (
//                 <>
//                   <Text style={styles.debugTitle}>Backend Response</Text>

//                   <Text style={styles.debugText}>Backend EAN: {lastScanResult.ean}</Text>
//                   <Text style={{
//                     color: lastScanResult.isValid ? '#00ff00' : '#ff4444',
//                     fontSize: 12
//                   }}>
//                     isValid: {String(lastScanResult.isValid)}
//                   </Text>
//                   <Text style={styles.debugText}>errorType: {lastScanResult.errorType || "none"}</Text>
//                   <Text style={styles.debugText}>matchedProductId: {lastScanResult.matchedProductId || "none"}</Text>
//                   <Text style={styles.debugText}>matchedSku: {lastScanResult.matchedSku || "none"}</Text>
//                   <Text style={styles.debugText}>expectedQty: {lastScanResult.expectedQuantity ?? "null"}</Text>
//                   <Text style={styles.debugText}>scannedQty: {lastScanResult.scannedQuantity ?? "null"}</Text>
//                 </>
//               )}

//               <Text style={styles.debugTitle}>Expected Order EANs</Text>
//               {order.items.map((item, i) => (
//                 <Text
//                   key={i}
//                   style={{
//                     color: item.ean === lastScannedEAN ? '#00ff00' : '#fff',
//                     fontSize: 12
//                   }}
//                 >
//                   • {item.name} → {item.ean || "NO EAN"}
//                 </Text>
//               ))}
//             </View>

//             {items.map((i, idx) => (
//               <View key={idx} style={styles.scanRow}>
//                 <Text>{i.name}</Text>
//                 <Text>{i.scannedQty}/{i.quantity}</Text>
//               </View>
//             ))}

//           </View>
//         </CameraView>
//       </View>
//     );
//   }


//   return (
//     <View style={styles.container}>
//       <StatusBar hidden />
//       <CameraView style={{ flex: 1 }} ref={cameraRef}>
//         <View style={styles.bottomControls}>
//           <TouchableOpacity onPress={takePicture} style={styles.shutterBtn}/>
//         </View>
//       </CameraView>
//     </View>
//   );
// };


// const styles = StyleSheet.create({
//   container:{flex:1,backgroundColor:'#000'},
//   watermarkGradient:{position:'absolute',bottom:0,left:0,right:0,padding:20},
//   wmTitle:{color:'#fff',fontWeight:'bold',fontSize:16},
//   wmSub:{color:'#ccc',fontSize:12},
//   actionOverlay:{position:'absolute',bottom:40,left:20,right:20,flexDirection:'row'},
//   btnBlur:{width:50,height:50,borderRadius:25,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center'},
//   btnPrimary:{flex:1,marginLeft:16,backgroundColor:COLORS.primary,borderRadius:30,alignItems:'center',justifyContent:'center'},
//   btnText:{color:'#fff',fontWeight:'bold'},
//   scanOverlay:{position:'absolute',top:50,left:20,right:20,backgroundColor:'rgba(0,0,0,0.85)',borderRadius:12,padding:16},
//   scanRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:6},
//   bottomControls:{position:'absolute',bottom:50,width:'100%',alignItems:'center'},
//   shutterBtn:{width:80,height:80,borderRadius:40,borderWidth:4,borderColor:'#fff'},

//   debugBox:{backgroundColor:'#111',padding:10,borderRadius:8,marginBottom:12},
//   debugTitle:{color:'#0f0',fontWeight:'bold',marginTop:6},
//   debugText:{color:'#fff',fontSize:12}
// });

// export default CameraScreen;




























import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View
} from 'react-native';

import { useMutation } from '@apollo/client';
import {
  BATCH_SCAN_ITEMS,
  COMPLETE_PACKING,
  UPLOAD_EVIDENCE
} from '../graphql/queries';

/* ======================================================
PHOTO STEPS
====================================================== */
const PHOTO_STEPS = [
  { id: 'inner', group: 'PRE', label: 'STEP 1 / 3', desc: 'Capture items inside box' },
  { id: 'protective', group: 'PRE', label: 'STEP 2 / 3', desc: 'Capture protective packaging' },
  { id: 'label', group: 'POST', label: 'STEP 3 / 3', desc: 'Capture sealed box & label' },
];

const CameraScreen = ({ navigation, route }) => {
  const { order, user } = route.params;

  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const [items, setItems] = useState(
    order.items.map(i => ({
      ...i,
      scannedQty: i.scannedCount || 0
    }))
  );

  const [scanLocked, setScanLocked] = useState(false);
  const [packingDone, setPackingDone] = useState(false);

  const [lastScannedEAN, setLastScannedEAN] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [evidencePaths, setEvidencePaths] = useState({ pre: [], post: [] });
  const [isProcessing, setIsProcessing] = useState(false);

  const currentStep = PHOTO_STEPS[currentStepIndex];

  const [batchScanMutation] = useMutation(BATCH_SCAN_ITEMS);
  const [uploadEvidenceMutation] = useMutation(UPLOAD_EVIDENCE);
  const [completePackingMutation] = useMutation(COMPLETE_PACKING);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    if (!mediaPermission?.granted) requestMediaPermission();
  }, []);

  /* ======================================================
     SCAN HANDLER — FIXED PAYLOAD
  ====================================================== */
  const handleBarcodeScan = async ({ data }) => {
    if (scanLocked) return;
    setScanLocked(true);
    setLastScannedEAN(data);

    const matchedItem = order.items.find(i => i.ean === data);

    if (!matchedItem) {
      Vibration.vibrate();
      Alert.alert('Unknown Item', `EAN ${data} does not match any item in this order.`);
      setTimeout(() => setScanLocked(false), 800);
      return;
    }

    try {
      const variables = {
        input: {
          packingOrderId: order.id,
          items: [
            { productId: matchedItem.productId, eans: [data] }
          ]
        }
      };

      console.log('BATCH SCAN PAYLOAD:', JSON.stringify(variables, null, 2));

      const response = await batchScanMutation({ variables, errorPolicy: 'all' });

      console.log('BATCH SCAN RESPONSE:', JSON.stringify(response, null, 2));

      if (response.errors?.length) {
        Vibration.vibrate();
        Alert.alert('Scan Error', response.errors[0].message);
        return;
      }

      const validation = response?.data?.batchScanItems?.validations?.[0];
      setLastScanResult(validation);

      if (!validation?.isValid) {
        Vibration.vibrate();
        Alert.alert('Invalid Item', validation?.errorMessage || validation?.errorType || 'Unknown error');
        return;
      }

      setItems(prev => {
        const updated = [...prev];
        const index = updated.findIndex(i => i.productId === validation.productId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            scannedQty: validation.scannedQuantity ?? updated[index].scannedQty + 1,
          };
        }
        return updated;
      });

    } catch (err) {
      console.log('NETWORK ERROR', err);
      Alert.alert('Network Error', err.message);
    } finally {
      setTimeout(() => setScanLocked(false), 800);
    }
  };

  /* ======================================================
     CHECK COMPLETE
  ====================================================== */
  useEffect(() => {
    const done = items.every(i => i.scannedQty >= i.quantity);
    if (done && !packingDone) {
      setPackingDone(true);
      Alert.alert("Scanning Complete");
    }
  }, [items]);

  /* ======================================================
     CAMERA CAPTURE
  ====================================================== */
  const takePicture = async () => {
    if (!cameraRef.current) return;
    const data = await cameraRef.current.takePictureAsync({ quality: 0.6 });
    setCurrentPhoto(data.uri);
  };

  /* ======================================================
     PHOTO FLOW
  ====================================================== */
  const confirmAndNext = async () => {
    setIsProcessing(true);
    try {
      const uri = await viewShotRef.current.capture();
      const newPaths = { ...evidencePaths };

      if (currentStep.group === 'PRE') newPaths.pre.push(uri);
      else newPaths.post.push(uri);

      setEvidencePaths(newPaths);

      if (currentStepIndex < PHOTO_STEPS.length - 1) {
        setCurrentPhoto(null);
        setCurrentStepIndex(i => i + 1);
        setIsProcessing(false);
      } else {
        await finalSubmission(newPaths);
      }
    } catch {
      Alert.alert("Photo processing failed");
      setIsProcessing(false);
    }
  };

  const finalSubmission = async (paths) => {
    try {
      const preImages = await Promise.all(
        paths.pre.map(uri => FileSystem.readAsStringAsync(uri, { encoding: 'base64' }))
      );

      const postImages = await Promise.all(
        paths.post.map(uri => FileSystem.readAsStringAsync(uri, { encoding: 'base64' }))
      );

      await uploadEvidenceMutation({
        variables: {
          input: {
            packingOrderId: order.id,
            prePackImages: preImages,
            postPackImages: postImages,
            actualBoxCode: null
          }
        }
      });

      await completePackingMutation({
        variables: { packingOrderId: order.id }
      });

      Alert.alert("SUCCESS", "Order packed", [
        { text: "Dashboard", onPress: () => navigation.navigate('Dashboard') }
      ]);

    } catch (err) {
      Alert.alert("Submission Error", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  if (!packingDone) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <CameraView
          style={{ flex: 1 }}
          ref={cameraRef}
          barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','qr'] }}
          onBarcodeScanned={handleBarcodeScan}
        >
          <View style={styles.scanOverlay}>

            <Text style={{color:'#fff'}}>Scanned: {lastScannedEAN}</Text>

            {items.map((i, idx) => (
              <View key={idx} style={styles.scanRow}>
                <Text style={{color:'#fff'}}>{i.name}</Text>
                <Text style={{color:'#fff'}}>{i.scannedQty}/{i.quantity}</Text>
              </View>
            ))}

          </View>
        </CameraView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000'},
  scanOverlay:{position:'absolute',top:50,left:20,right:20,backgroundColor:'rgba(0,0,0,0.85)',borderRadius:12,padding:16},
  scanRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:6}
});

export default CameraScreen;
