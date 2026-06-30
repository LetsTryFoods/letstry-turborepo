import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  Modal,
  FlatList,
} from 'react-native';

import { useMutation, useQuery } from '@apollo/client';
import { BATCH_SCAN_ITEMS, COMPLETE_PACKING, UPLOAD_EVIDENCE, GET_GLOBAL_SETTINGS, MARK_ITEM_SHORT, GET_ACTIVE_BOX_SIZES, ASSIGN_BOX_TO_ORDER } from '../graphql/queries';
import { COLORS } from '../constants/theme';
import { API_URL } from '../config/api';

const CameraScreen = ({ navigation, route }) => {
  const { order, user } = route.params;
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [items, setItems] = useState(
    order.items.map(i => {
      const comboEans = i.ean ? i.ean.split(',').map(e => e.trim()).filter(e => e) : [];
      const isCombo = comboEans.length > 1;
      return {
        ...i,
        isCombo,
        comboEans,
        scannedQty: i.scannedCount || 0,
        shortQty: i.shortCount || 0,
        shortComponentCount: i.shortComponentCount || 0
      };
    })
  );
  const pendingScans = useRef({});
  // Use a ref for scan lock so iOS camera's rapid callbacks always see the latest value
  const scanLockedRef = useRef(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [allScanned, setAllScanned] = useState(false);
  const [boxPhotos, setBoxPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const [batchScanMutation] = useMutation(BATCH_SCAN_ITEMS);
  const [markItemShortMutation] = useMutation(MARK_ITEM_SHORT);
  const [uploadEvidenceMutation] = useMutation(UPLOAD_EVIDENCE);
  const [completePackingMutation] = useMutation(COMPLETE_PACKING);
  const [assignBoxMutation] = useMutation(ASSIGN_BOX_TO_ORDER);

  const { data: settingsData } = useQuery(GET_GLOBAL_SETTINGS, { fetchPolicy: 'network-only' });
  const isBypassEnabled = settingsData?.getGlobalSettings?.isPackerScanBypassEnabled || false;

  const { data: boxesData } = useQuery(GET_ACTIVE_BOX_SIZES, { fetchPolicy: 'cache-first' });
  const activeBoxes = boxesData?.getActiveBoxSizes || [];

  const [showBoxModal, setShowBoxModal] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  const getNeeded = (item) => {
    const nonShorted = item.quantity - (item.shortQty || 0);
    return item.isCombo
      ? Math.max(0, (nonShorted * item.comboEans.length) - (item.shortComponentCount || 0))
      : Math.max(0, nonShorted);
  };

  // Helper to lock/unlock scanner via BOTH ref and state
  const lockScanner = () => {
    scanLockedRef.current = true;
    setScanLocked(true);
  };
  const unlockScanner = () => {
    scanLockedRef.current = false;
    setScanLocked(false);
  };

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    // FIX: Configure audio session so sound plays even when iPhone is on silent/ringer off
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
  }, []);

  useEffect(() => {
    if (isBypassEnabled) {
      if (!allScanned) {
        setAllScanned(true);
        Alert.alert('Scan Bypassed', 'Please take 5 photos of the packed items.');
      }
      return;
    }

    const done = items.every(i => i.scannedQty >= getNeeded(i));
    if (done && items.length > 0 && !allScanned) {
      setAllScanned(true);
      Alert.alert('✅ All Items Scanned!', 'Please take 5 photos of the packed items and box.');
    }
  }, [items, isBypassEnabled]);

  const handleBarcodeScan = async ({ data }) => {
    // Use the REF here (not state) — state updates are async and iOS fires this many times per second
    if (scanLockedRef.current || allScanned) {
      return;
    }

    lockScanner();
    setLastScanned(data);

    const currentItems = items;
    const matchedItem = currentItems.find(i => i.ean === data || (i.isCombo && i.comboEans.includes(data)));
    if (!matchedItem) {
      Vibration.vibrate([0, 100, 80, 100]);
      Speech.speak('Wrong item', { rate: 1.2 });
      Alert.alert('Unknown EAN', `${data} is not in this order.`, [
        { text: 'OK', onPress: () => setTimeout(unlockScanner, 500) }
      ]);
      return;
    }

    const needed = getNeeded(matchedItem);

    if (matchedItem.scannedQty >= needed) {
      Vibration.vibrate([0, 100, 80, 100]);
      Speech.speak('Already done', { rate: 1.2 });
      Alert.alert('Already Scanned', `${matchedItem.name} is already fully scanned.`, [
        { text: 'OK', onPress: () => setTimeout(unlockScanner, 500) }
      ]);
      return;
    }

    const pid = matchedItem.productId;
    if (!pendingScans.current[pid]) pendingScans.current[pid] = [];
    pendingScans.current[pid].push(data);

    const collected = pendingScans.current[pid].length;

    if (matchedItem.isCombo) {
      Speech.speak("Combo item scanned", { rate: 1.2 });
    } else {
      Speech.speak(collected.toString());
    }

    if (collected < needed) {
      setItems(prev =>
        prev.map(i => i.productId === pid ? { ...i, scannedQty: collected } : i)
      );
      setTimeout(unlockScanner, 1200);
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
        Alert.alert('Scan Error', response.errors[0].message, [
          { text: 'OK', onPress: () => setTimeout(unlockScanner, 500) }
        ]);
        return;
      }

      const validation = response?.data?.batchScanItems?.validations?.[0];
      if (!validation?.isValid) {
        Vibration.vibrate([0, 100, 80, 100]);
        pendingScans.current[pid] = [];
        Speech.speak('Scan failed', { rate: 1.2 });
        Alert.alert('Invalid', validation?.errorMessage || 'Scan failed', [
          { text: 'OK', onPress: () => setTimeout(unlockScanner, 500) }
        ]);
        return;
      }

      setItems(prev =>
        prev.map(i => i.productId === pid ? { ...i, scannedQty: needed } : i)
      );
      Speech.speak("Done");
    } catch (err) {
      pendingScans.current[pid] = [];
      Alert.alert('Network Error', err.message, [
        { text: 'OK', onPress: () => setTimeout(unlockScanner, 500) }
      ]);
      return;
    }

    setTimeout(unlockScanner, 1200);
  };

  const handleMarkShort = (item) => {
    const needed = getNeeded(item);
    const remaining = needed - item.scannedQty;
    if (remaining <= 0) return;

    if (item.isCombo) {
      Alert.alert(
        'Mark Missing',
        `Is an entire Combo missing, or just a single component?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Single Component',
            onPress: () => submitShort(item, 1, true)
          },
          {
            text: 'Full Combo',
            onPress: () => submitShort(item, 1, false)
          }
        ]
      );
    } else {
      Alert.alert(
        'Mark Missing',
        `How many ${item.name} are missing? (Up to ${remaining})`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: `Mark ${remaining} Missing`,
            style: 'destructive',
            onPress: () => submitShort(item, remaining, false)
          }
        ]
      );
    }
  };

  const submitShort = async (item, shortQty, isComponent) => {
    try {
      const res = await markItemShortMutation({
        variables: {
          packingOrderId: order.id || order._id,
          productId: item.productId,
          shortQty,
          isComponent
        }
      });
      if (res.data) {
        setItems(prev => prev.map(i => {
          if (i.productId === item.productId) {
            if (isComponent) {
              return { ...i, shortComponentCount: (i.shortComponentCount || 0) + shortQty };
            } else {
              return { ...i, shortQty: (i.shortQty || 0) + shortQty };
            }
          }
          return i;
        }));
        Alert.alert('Marked', `${shortQty} ${isComponent ? 'component(s)' : 'item(s)'} marked as missing.`);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const takeBoxPhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setBoxPhotos(prev => [...prev, photo.uri]);
  };

  const retakePhoto = () => setBoxPhotos([]);

  const handleCompletePress = () => {
    if (!selectedBoxId) {
      setShowBoxModal(true);
      return;
    }
    handleComplete(selectedBoxId);
  };

  const handleComplete = async (boxId) => {
    setIsSubmitting(true);
    try {
      const restApiUrl = API_URL.replace('/graphql', '');
      const uploadedKeys = await Promise.all(
        boxPhotos.map(async (uri, index) => {
          const filename = `box-photo-${order.id}-${index}.jpg`;
          const presignedRes = await fetch(`${restApiUrl}/files/presigned-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, contentType: 'image/jpeg' }),
          });

          if (!presignedRes.ok) {
            throw new Error('Failed to get upload URL');
          }
          const presignedData = await presignedRes.json();

          const response = await fetch(uri);
          const blob = await response.blob();

          const uploadRes = await fetch(presignedData.uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': 'image/jpeg',
            },
          });

          if (!uploadRes.ok) {
            throw new Error('Failed to upload image to CDN');
          }

          return presignedData.key;
        })
      );

      await uploadEvidenceMutation({
        variables: {
          input: {
            packingOrderId: order.id,
            prePackImages: uploadedKeys,
            postPackImages: [],
            actualBoxCode: null,
          },
        },
      });

      await completePackingMutation({
        variables: {
          packingOrderId: order.id,
        },
      });

      if (boxId) {
        await assignBoxMutation({
          variables: {
            input: {
              orderId: order.orderId,
              boxId: boxId,
            }
          }
        });
      }

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
    const isPhotoComplete = boxPhotos.length >= 5;

    return (
      <View style={styles.container}>
        <StatusBar hidden />
        {isPhotoComplete ? (
          <View style={styles.container}>
            <View style={styles.photoHeader}>
              <Text style={styles.photoTitle}>Box Photo Preview</Text>
              <Text style={styles.photoSub}>Order #{order.orderNumber} — {boxPhotos.length}/5 photos captured ✓</Text>
            </View>
            <ScrollView contentContainerStyle={styles.photoGrid}>
              {boxPhotos.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.photoThumb}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
                <Ionicons name="refresh" size={20} color={COLORS.textDark} />
                <Text style={styles.retakeBtnText}>Retake All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCompletePress} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>{selectedBoxId ? "Complete Order" : "Select Box & Complete"}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Modal visible={showBoxModal} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Box Used</Text>
                  <Text style={styles.modalSubtitle}>Please select the box size you used for packing.</Text>
                  
                  <FlatList
                    data={activeBoxes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[styles.boxOption, selectedBoxId === item.id && styles.boxOptionSelected]}
                        onPress={() => setSelectedBoxId(item.id)}
                      >
                        <Text style={[styles.boxName, selectedBoxId === item.id && styles.boxNameSelected]}>{item.name}</Text>
                        <Text style={styles.boxDim}>{item.lengthInches}x{item.breadthInches}x{item.heightInches}&quot;</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.boxList}
                  />

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBoxModal(false)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.confirmBtn, !selectedBoxId && styles.confirmBtnDisabled]} 
                      disabled={!selectedBoxId}
                      onPress={() => {
                        setShowBoxModal(false);
                        handleComplete(selectedBoxId);
                      }}
                    >
                      <Text style={styles.confirmBtnText}>Confirm Box</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        ) : (
          // FIX: Use absolute positioning overlay OUTSIDE CameraView (no children in CameraView on iOS)
          <View style={styles.container}>
            <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} />
            <View style={styles.photoOverlay}>
              <View style={styles.photoPromptBox}>
                <Ionicons name="camera" size={36} color="#fff" />
                <Text style={styles.photoPromptTitle}>{`Take Photos (${boxPhotos.length}/5)`}</Text>
                <Text style={styles.photoPromptSub}>Capture 5 photos of the packed items and sealed box.</Text>
              </View>
              <TouchableOpacity style={styles.shutterBtn} onPress={takeBoxPhoto}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // FIX: Use absolute positioning overlay OUTSIDE CameraView (no children in CameraView on iOS)
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'code128'] }}
        onBarcodeScanned={handleBarcodeScan}
      />
      <View style={styles.scanOverlay}>
        <Text style={styles.overlayTitle}>📦 Scan Items — Order #{order.orderNumber}</Text>
        {order.shippingInfo && (
          <View style={styles.addressBanner}>
            <Text style={styles.addressText} numberOfLines={1}>
              To: {order.shippingInfo.recipientName} · {order.shippingInfo.city} - {order.shippingInfo.pincode}
            </Text>
          </View>
        )}
        {lastScanned ? (
          <Text style={styles.lastScanned}>Last scanned: {lastScanned}</Text>
        ) : null}
        <View style={styles.divider} />
        {items.map((item, idx) => {
          const needed = getNeeded(item);
          const done = item.scannedQty >= needed;
          const hasShort = (item.shortQty || 0) > 0 || (item.shortComponentCount || 0) > 0;
          const pending = pendingScans.current[item.productId]?.length || 0;
          const display = done ? needed : pending;
          return (
            <View key={idx} style={styles.itemRow}>
              <Ionicons
                name={done ? 'checkmark-circle' : pending > 0 ? 'hourglass-outline' : 'ellipse-outline'}
                size={20}
                color={done ? (hasShort ? '#f97316' : '#4ade80') : pending > 0 ? '#fb923c' : '#facc15'}
                style={{ marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, done && (hasShort ? { color: '#f97316' } : styles.itemDone)]} numberOfLines={1}>
                  {item.name} {item.isCombo ? '(Combo)' : ''}
                </Text>
                {(item.dimensions?.weight || item.unitPrice) ? (
                  <Text style={{ color: done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                    {item.dimensions?.weight ? `${item.dimensions.weight}${item.dimensions.unit}  ` : ''}
                    {item.unitPrice ? `₹${item.unitPrice}` : ''}
                  </Text>
                ) : null}
                {hasShort && (
                  <Text style={{ color: '#f97316', fontSize: 10 }}>
                    Marked {item.shortQty || 0} full, {item.shortComponentCount || 0} comp. missing
                  </Text>
                )}
              </View>
              {!done && (
                <TouchableOpacity onPress={() => handleMarkShort(item)} style={{ marginRight: 12, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                  <Text style={{ color: '#f87171', fontSize: 10 }}>Mark Missing</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.itemCount, done && (hasShort ? { color: '#f97316' } : styles.itemCountDone)]}>
                {item.scannedQty}/{needed}
              </Text>
            </View>
          );
        })}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {
            width: `${(items.reduce((s, i) => s + Math.min(i.scannedQty, getNeeded(i)), 0) / (items.reduce((s, i) => s + getNeeded(i), 0) || 1)) * 100}%`
          }]} />
        </View>
        <Text style={styles.progressText}>
          {items.reduce((s, i) => s + Math.min(i.scannedQty, getNeeded(i)), 0)} / {items.reduce((s, i) => s + getNeeded(i), 0)} scanned
        </Text>
      </View>
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
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, backgroundColor: '#111' },
  photoThumb: { width: '48%', aspectRatio: 1, margin: '1%', borderRadius: 10 },
  photoActions: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', gap: 12 },
  retakeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, height: 52, gap: 8 },
  retakeBtnText: { fontWeight: '600', color: COLORS.textDark },
  submitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22c55e', borderRadius: 12, height: 52, gap: 8 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  addressBanner: {
    backgroundColor: 'rgba(79, 70, 229, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.5)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  addressText: {
    color: '#a5f3fc',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 16 },
  boxList: { maxHeight: 300 },
  boxOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#334155', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  boxOptionSelected: { borderColor: COLORS.primary, backgroundColor: 'rgba(79, 70, 229, 0.2)' },
  boxName: { color: '#fff', fontSize: 16, fontWeight: '500' },
  boxNameSelected: { color: COLORS.primary, fontWeight: 'bold' },
  boxDim: { color: '#94a3b8', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 14, backgroundColor: '#334155', borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: '#e2e8f0', fontWeight: '600' },
  confirmBtn: { flex: 2, padding: 14, backgroundColor: COLORS.primary, borderRadius: 10, alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default CameraScreen;
