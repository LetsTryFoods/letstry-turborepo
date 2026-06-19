import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Linking,
  Share,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useLazyQuery, useQuery, gql } from '@apollo/client';
import * as FileSystem from 'expo-file-system/legacy';
import { COLORS } from '../constants/theme';
import { API_URL, getCdnUrl } from '../config/api';
import { ADMIN_PUNCH_SHIPMENT, GET_ACTIVE_BOX_SIZES, ASSIGN_BOX_TO_ORDER, GET_ORDER_DETAILS } from '../graphql/queries';

const { width, height } = Dimensions.get('window');

const GET_SHIPMENT_LABEL = gql`
  query GetShipmentLabel($awbNumber: String!) {
    getShipmentLabel(awbNumber: $awbNumber)
  }
`;

const PackedOrderDetailScreen = ({ route, navigation }) => {
  const { order: routeOrder } = route.params;

  const { data: detailsData, loading: detailsLoading } = useQuery(GET_ORDER_DETAILS, {
    variables: { id: routeOrder.id || routeOrder.orderId },
    fetchPolicy: 'cache-and-network',
  });

  const order = detailsData?.getPackingOrder || routeOrder;
  const [orderState, setOrderState] = useState(order);

  // Update orderState when data arrives
  React.useEffect(() => {
    if (detailsData?.getPackingOrder) {
      setOrderState(detailsData.getPackingOrder);
    }
  }, [detailsData]);

  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isDownloadingCustom, setIsDownloadingCustom] = useState(false);
  const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const [getLabelQuery] = useLazyQuery(GET_SHIPMENT_LABEL, {
    fetchPolicy: 'network-only',
  });

  const [punchShipment, { loading: isPunching }] = useMutation(ADMIN_PUNCH_SHIPMENT, {
    onCompleted: (data) => {
      const updatedOrder = {
        ...orderState,
        status: data?.adminPunchShipment?.status || 'COMPLETED',
        shipmentInfo: data?.adminPunchShipment?.shipmentInfo,
      };
      setOrderState(updatedOrder);
      Alert.alert('Success', `Shipment booked successfully via ${data?.adminPunchShipment?.shipmentInfo?.provider}.\nAWB: ${data?.adminPunchShipment?.shipmentInfo?.awbNumber}`);
    },
    onError: (err) => {
      Alert.alert('Punch Error', err.message || 'Failed to punch shipment');
    },
  });

  const [showBoxModal, setShowBoxModal] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  const { data: boxesData } = useQuery(GET_ACTIVE_BOX_SIZES, { fetchPolicy: 'cache-first' });
  const activeBoxes = boxesData?.getActiveBoxSizes || [];

  const [assignBoxMutation, { loading: isAssigning }] = useMutation(ASSIGN_BOX_TO_ORDER, {
    onCompleted: (data) => {
      const updatedOrder = {
        ...orderState,
        boxId: data.assignBoxToOrder.boxId,
        volumetricWeight: data.assignBoxToOrder.volumetricWeight,
        region: data.assignBoxToOrder.region,
        logisticsCost: data.assignBoxToOrder.logisticsCost,
      };
      setOrderState(updatedOrder);
      setShowBoxModal(false);
      Alert.alert('Success', 'Box assigned successfully');
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to assign box');
    },
    // Refetch packing order detail + history so cache is fresh when user navigates back
    refetchQueries: [
      {
        query: GET_ORDER_DETAILS,
        variables: { id: routeOrder.id || routeOrder.orderId },
      },
      'GetMyHistory',
    ],
    awaitRefetchQueries: true,
  });

  const handleAssignBox = () => {
    if (!selectedBoxId) {
      Alert.alert('Error', 'Please select a box first');
      return;
    }
    assignBoxMutation({
      variables: {
        input: {
          orderId: orderState.orderId,
          boxId: selectedBoxId,
        },
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const handleDownloadImage = async (imgKey) => {
    try {
      setIsDownloadingImage(true);
      const url = getCdnUrl(imgKey);
      const filename = imgKey.split('/').pop() || `evidence_${Date.now()}.jpg`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;
      const downloadResult = await FileSystem.downloadAsync(url, localUri);
      await Share.share({
        url: downloadResult.uri,
        title: 'Packing Evidence Photo',
        message: 'Packing Evidence Photo',
      });
    } catch (err) {
      Alert.alert('Download Failed', err.message || 'Could not download image');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handlePunch = (provider) => {
    Alert.alert(
      'Confirm Shipment Booking',
      `Are you sure you want to book this order using ${provider}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            punchShipment({
              variables: {
                input: {
                  orderId: orderState.orderId,
                  provider: provider,
                  serviceType: provider === 'DTDC' ? 'GROUND EXPRESS' : 'Standard',
                },
              },
            });
          },
        },
      ]
    );
  };

  const handleDownloadInvoice = async () => {
    try {
      const restApiUrl = API_URL.replace('/graphql', '');
      const downloadUrl = `${restApiUrl}/orders/${orderState.orderId}/invoice`;
      await Linking.openURL(downloadUrl);
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to open invoice URL');
    }
  };

  const handleDownloadCustomLabel = async () => {
    try {
      const restApiUrl = API_URL.replace('/graphql', '');
      const downloadUrl = `${restApiUrl}/orders/${orderState.orderId}/custom-label`;
      await Linking.openURL(downloadUrl);
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to download custom label');
    }
  };

  const handleDownloadShippingLabel = async () => {
    try {
      const awb = orderState.shipmentInfo?.awbNumber;
      if (!awb) {
        Alert.alert('Error', 'No AWB number found for this order. Please book a shipment first.');
        return;
      }
      const restApiUrl = API_URL.replace('/graphql', '');
      const downloadUrl = `${restApiUrl}/shipments/label/${awb}/download`;
      await Linking.openURL(downloadUrl);
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to download shipping label');
    }
  };

  const images = orderState.evidence?.prePackImages || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {detailsLoading && !orderState.items ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textLight }}>Loading details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Order Info Card */}
          <View style={styles.card}>
            <View>
              <Text style={styles.orderNumber}>#{orderState.orderNumber || orderState.orderId}</Text>
              <Text style={styles.dateText}>Packed: {formatDate(orderState.packingCompletedAt)}</Text>
              <View style={[styles.statusBadge, styles.statusCompleted]}>
                <Text style={styles.statusText}>{orderState.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Items Packed:</Text>
            {orderState.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginRight: 6 }} />
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
            ))}
          </View>

          {/* Customer Address Card */}
          <View style={styles.card}>
            <View style={[styles.row, { marginBottom: 12 }]}>
              <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
              <Text style={[styles.cardTitle, { marginLeft: 6 }]}>Delivery Address</Text>
            </View>
            {orderState.shippingInfo ? (
              <View>
                <Text style={styles.customerName}>{orderState.shippingInfo.recipientName}</Text>
                {orderState.shippingInfo.recipientPhone ? (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${orderState.shippingInfo.recipientPhone}`)}>
                    <Text style={[styles.customerPhone, { color: COLORS.primary, textDecorationLine: 'underline', marginBottom: 6 }]}>
                      📞 {orderState.shippingInfo.recipientPhone}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <Text style={styles.customerAddress}>
                  {orderState.shippingInfo.addressLine1}
                  {orderState.shippingInfo.addressLine2 ? `\n${orderState.shippingInfo.addressLine2}` : ''}
                  {`\n${orderState.shippingInfo.city}, ${orderState.shippingInfo.state} - ${orderState.shippingInfo.pincode}`}
                </Text>
              </View>
            ) : (
              <Text style={styles.noData}>No address details available</Text>
            )}
          </View>

          {/* Box & Logistics Info Card */}
          <View style={styles.card}>
            <View style={[styles.row, { marginBottom: 12, justifyContent: 'space-between' }]}>
              <View style={styles.row}>
                <Ionicons name="cube" size={20} color={COLORS.primary} />
                <Text style={[styles.cardTitle, { marginLeft: 6 }]}>Logistics & Box Info</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBoxModal(true)}>
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
                  {orderState.boxId ? 'Change Box' : 'Assign Box'}
                </Text>
              </TouchableOpacity>
            </View>

            {orderState.boxId ? (
              <View style={styles.logisticsBox}>
                <View style={styles.row}>
                  <Text style={styles.shipmentFieldLabel}>Assigned Box:</Text>
                  <Text style={styles.shipmentValueText}>
                    {activeBoxes.find(b => b.id === orderState.boxId)?.name || orderState.boxId}
                  </Text>
                </View>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Text style={styles.shipmentFieldLabel}>Volumetric Weight:</Text>
                  <Text style={styles.shipmentValueText}>{orderState.volumetricWeight?.toFixed(2)} kg</Text>
                </View>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Text style={styles.shipmentFieldLabel}>Region Rate Map:</Text>
                  <Text style={styles.shipmentValueText}>{orderState.region || "N/A"}</Text>
                </View>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Text style={styles.shipmentFieldLabel}>Estimated Cost:</Text>
                  <Text style={[styles.shipmentValueText, { color: COLORS.primary }]}>₹{orderState.logisticsCost?.toFixed(2) || "0.00"}</Text>
                </View>
              </View>
            ) : (
              <View style={{ padding: 10, backgroundColor: '#fff3cd', borderRadius: 8 }}>
                <Text style={{ color: '#856404' }}>No box assigned. Please assign a box to calculate logistics cost.</Text>
              </View>
            )}
          </View>

          {/* Evidence Photos */}
          <View style={styles.card}>
            <View style={[styles.row, { marginBottom: 12 }]}>
              <Ionicons name="images" size={20} color={COLORS.primary} />
              <Text style={[styles.cardTitle, { marginLeft: 6 }]}>Packing Evidence ({images.length})</Text>
            </View>
            {images.length > 0 ? (
              <>
                <Text style={styles.tapHint}>Tap an image to view full screen</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {images.map((img, index) => (
                    <TouchableOpacity key={index} onPress={() => openLightbox(index)} activeOpacity={0.85}>
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: getCdnUrl(img) }} style={styles.evidenceImage} />
                        <View style={styles.imageOverlay}>
                          <Ionicons name="expand-outline" size={18} color="#fff" />
                        </View>
                        <Text style={styles.imageLabel}>Photo {index + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <Text style={styles.noData}>No evidence photos uploaded</Text>
            )}
          </View>

          {/* Lightbox Modal */}
          <Modal
            visible={lightboxVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setLightboxVisible(false)}
            statusBarTranslucent
          >
            <View style={styles.lightboxBg}>
              <SafeAreaView style={styles.lightboxSafe}>
                {/* Lightbox Header */}
                <View style={styles.lightboxHeader}>
                  <Text style={styles.lightboxCounter}>{lightboxIndex + 1} / {images.length}</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity
                      onPress={() => handleDownloadImage(images[lightboxIndex])}
                      disabled={isDownloadingImage}
                      style={styles.lightboxActionBtn}
                    >
                      {isDownloadingImage
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Ionicons name="download-outline" size={24} color="#fff" />
                      }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLightboxVisible(false)} style={styles.lightboxActionBtn}>
                      <Ionicons name="close" size={26} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Image Pager */}
                <FlatList
                  data={images}
                  keyExtractor={(_, i) => String(i)}
                  horizontal
                  pagingEnabled
                  initialScrollIndex={lightboxIndex}
                  showsHorizontalScrollIndicator={false}
                  getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                  onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                    setLightboxIndex(newIndex);
                  }}
                  renderItem={({ item }) => (
                    <View style={styles.lightboxImageWrapper}>
                      <Image
                        source={{ uri: getCdnUrl(item) }}
                        style={styles.lightboxImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                />

                {/* Nav arrows for convenience */}
                <View style={styles.lightboxNav}>
                  <TouchableOpacity
                    style={[styles.navBtn, lightboxIndex === 0 && styles.navBtnDisabled]}
                    onPress={() => lightboxIndex > 0 && setLightboxIndex(lightboxIndex - 1)}
                    disabled={lightboxIndex === 0}
                  >
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navBtn, lightboxIndex === images.length - 1 && styles.navBtnDisabled]}
                    onPress={() => lightboxIndex < images.length - 1 && setLightboxIndex(lightboxIndex + 1)}
                    disabled={lightboxIndex === images.length - 1}
                  >
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </Modal>

          {/* Box Selection Modal */}
          <Modal visible={showBoxModal} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Box Size</Text>
                <Text style={styles.modalSubtitle}>Please choose the box you used for packing.</Text>

                <FlatList
                  data={activeBoxes}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.boxOption,
                        selectedBoxId === item.id && styles.boxOptionSelected
                      ]}
                      onPress={() => setSelectedBoxId(item.id)}
                    >
                      <Text style={[
                        styles.boxOptionText,
                        selectedBoxId === item.id && styles.boxOptionTextSelected
                      ]}>
                        {item.name} ({item.lengthInches}x{item.breadthInches}x{item.heightInches} in)
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBoxModal(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, !selectedBoxId && { opacity: 0.5 }]}
                    onPress={handleAssignBox}
                    disabled={!selectedBoxId || isAssigning}
                  >
                    {isAssigning ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmBtnText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Shipment Details & Booking */}
          <View style={styles.card}>
            <View style={[styles.row, { marginBottom: 12 }]}>
              <Ionicons name="bus-sharp" size={20} color={COLORS.primary} />
              <Text style={[styles.cardTitle, { marginLeft: 6 }]}>Shipment Status</Text>
            </View>

            {orderState.shipmentInfo?.awbNumber ? (
              <View style={styles.shipmentDetailsBox}>
                <View style={styles.row}>
                  <Text style={styles.shipmentFieldLabel}>AWB Number:</Text>
                  <Text style={styles.shipmentValueText}>{orderState.shipmentInfo.awbNumber}</Text>
                </View>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Text style={styles.shipmentFieldLabel}>Provider:</Text>
                  <Text style={[styles.shipmentValueText, styles.providerText]}>
                    {orderState.shipmentInfo.provider?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.notBookedText}>Shipment booking has not been initiated for this order yet.</Text>
                <View style={styles.punchButtonsRow}>
                  <TouchableOpacity
                    style={[styles.punchBtn, styles.dtdcBtn]}
                    onPress={() => handlePunch('DTDC')}
                    disabled={isPunching}
                  >
                    <Ionicons name="cube-outline" size={18} color="#fff" />
                    <Text style={styles.punchBtnText}>Punch DTDC</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.punchBtn, styles.rocketBtn]}
                    onPress={() => handlePunch('SHIPROCKET')}
                    disabled={isPunching}
                  >
                    <Ionicons name="rocket-outline" size={18} color="#fff" />
                    <Text style={styles.punchBtnText}>Punch Shiprocket</Text>
                  </TouchableOpacity>
                </View>
                {isPunching && (
                  <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />
                )}
              </View>
            )}
          </View>

          {/* Document Downloads Section */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Documents</Text>

            <TouchableOpacity
              style={styles.downloadRowButton}
              onPress={handleDownloadInvoice}
              disabled={isDownloadingInvoice}
            >
              <View style={styles.downloadRowLeft}>
                <View style={[styles.iconBg, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="document-text" size={22} color="#dc2626" />
                </View>
                <Text style={styles.downloadButtonText}>Download Invoice PDF</Text>
              </View>
              {isDownloadingInvoice ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Ionicons name="download-outline" size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadRowButton}
              onPress={handleDownloadCustomLabel}
              disabled={isDownloadingCustom}
            >
              <View style={styles.downloadRowLeft}>
                <View style={[styles.iconBg, { backgroundColor: '#e0f2fe' }]}>
                  <Ionicons name="barcode" size={22} color="#0284c7" />
                </View>
                <Text style={styles.downloadButtonText}>Download Custom Label PDF</Text>
              </View>
              {isDownloadingCustom ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Ionicons name="download-outline" size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.downloadRowButton,
                !orderState.shipmentInfo?.awbNumber && styles.disabledDownloadButton,
              ]}
              onPress={handleDownloadShippingLabel}
              disabled={isDownloadingLabel || !orderState.shipmentInfo?.awbNumber}
            >
              <View style={styles.downloadRowLeft}>
                <View style={[
                  styles.iconBg,
                  { backgroundColor: orderState.shipmentInfo?.awbNumber ? '#dcfce7' : '#f1f5f9' },
                ]}>
                  <Ionicons
                    name="print"
                    size={22}
                    color={orderState.shipmentInfo?.awbNumber ? '#16a34a' : '#94a3b8'}
                  />
                </View>
                <Text style={[
                  styles.downloadButtonText,
                  !orderState.shipmentInfo?.awbNumber && { color: '#94a3b8' },
                ]}>
                  Download Shipping Label PDF
                </Text>
              </View>
              {isDownloadingLabel ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={orderState.shipmentInfo?.awbNumber ? COLORS.textLight : '#cbd5e1'}
                />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
    flexShrink: 1,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  itemQty: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  customerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  customerAddress: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  noData: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 12,
  },
  imageScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  imageContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  evidenceImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  imageLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 6,
  },
  logisticsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shipmentDetailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shipmentFieldLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  shipmentValueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  providerText: {
    color: COLORS.primary,
  },
  notBookedText: {
    fontSize: 13,
    color: '#92400e',
    backgroundColor: '#fffbeb',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 14,
  },
  punchButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  punchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 10,
  },
  dtdcBtn: {
    backgroundColor: '#2563eb',
  },
  rocketBtn: {
    backgroundColor: '#7c3aed',
  },
  punchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  downloadRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  disabledDownloadButton: {
    opacity: 0.5,
  },
  downloadRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  tapHint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  imageOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    padding: 4,
  },
  // Lightbox
  lightboxBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.97)',
  },
  lightboxSafe: {
    flex: 1,
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lightboxCounter: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  lightboxActionBtn: {
    padding: 6,
  },
  lightboxImageWrapper: {
    width: width,
    height: height * 0.72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: width,
    height: height * 0.72,
  },
  lightboxNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 10,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%'
  },
  modalTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  modalSubtitle: {
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: 16
  },
  boxOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  boxOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#eef2ff'
  },
  boxOptionText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '500'
  },
  boxOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelBtnText: {
    color: COLORS.textDark,
    fontWeight: '600'
  },
  confirmBtn: {
    flex: 2,
    padding: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center'
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
});

export default PackedOrderDetailScreen;
