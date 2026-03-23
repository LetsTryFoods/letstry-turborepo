import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { makeCardPayment } from '../services/PaymentService';
import { placeOrder } from '../services/OrderService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";

const EMAIL = 'tech@letstryfoods.com';

const CardScreen = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { calculateGrandTotal, appliedCoupon } = useCart();
  const insets = useSafeAreaInsets();
  const { idToken } = useAuth();
  const { selectedAddress } = useAddress();

  // Amount passed via route or fallback to cart total
  const amount = route.params?.amount;

  const handleExpiryChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    setExpiry(cleaned);
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv || !nameOnCard || !selectedAddress?.addressId) {
      console.log('Incomplete Details: Please fill all card details and ensure an address is selected.');
      return;
    }
    setIsLoading(true);

    try {
      // 1. Place the order and get orderId (now sending addressId instead of full address)
      const orderData = { addressId: selectedAddress?.addressId, promoCode: appliedCoupon?.code || null };
      console.log("[CARD PAYMENT] Sending orderData to API:", orderData);
      const orderResponse = await placeOrder(orderData, idToken);
      const orderId = orderResponse.orderId;

      // Validate prices between frontend and backend
      const frontendTotal = calculateGrandTotal();
      const backendTotal = orderResponse.totalAmount;
      if (Number(frontendTotal) !== Number(backendTotal)) {
        throw new Error('Price mismatch detected.');
      }

      // 2. Prepare card payment data
      const [expiryMonth, expiryYearShort] = expiry.split('/');
      const cardData = {
        cardNumber,
        cvv,
        expiryMonth,
        expiryYear: expiryYearShort ? `20${expiryYearShort}` : '',
        nameOnCard,
        amount: amount ? amount.toString() : calculateGrandTotal().toFixed(0).toString(),
        orderId: orderId,
        email: EMAIL,
      };

      // 3. Call card payment API
      const result = await makeCardPayment(cardData);
      console.log("Card Payment Response:", result);

      if (result.doRedirect && result.postUrl && result.bankPostData) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <body onload="document.forms[0].submit()">
              <form action="${result.postUrl}" method="POST">
                <input type="hidden" name="merchantIdentifier" value="${result.bankPostData.merchantIdentifier}" />
                <input type="hidden" name="checksum" value="${result.bankPostData.checksum}" />
                <input type="hidden" name="encryptedcvv" value="${result.bankPostData.encryptedcvv}" />
                <input type="hidden" name="txnId" value="${result.bankPostData.txnId}" />
                <noscript><input type="submit" value="Continue"></noscript>
              </form>
            </body>
          </html>
        `;

        navigation.navigate('WebViewScreen', {
          htmlContent: htmlContent,
          returnUrl: 'https://zaakpay.com/api/paymentTransact/v4/checksum',
          orderId: orderId,
        });
      } else {
        console.log('Payment Status:', result.responseDescription || 'Unknown response');
      }
    } catch (error) {
      console.error('Error in card payment flow:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.header} allowFontScaling={false} adjustsFontSizeToFit={true}>
          Credit / Debit Card
        </Text>
      </View>

      <Text style={styles.label}>Card Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Card number"
        placeholderTextColor="grey"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={text => setCardNumber(text.replace(/\D/g, '').slice(0, 16))}
        maxLength={16}
      />

      <Text style={styles.label}>Account Holder's Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="grey"
        value={nameOnCard}
        onChangeText={setNameOnCard}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Expiry (MM/YY)</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            placeholderTextColor="grey"
            value={expiry}
            onChangeText={handleExpiryChange}
            maxLength={5}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="CVV"
            placeholderTextColor="grey"
            value={cvv}
            onChangeText={text => setCvv(text.replace(/\D/g, '').slice(0, 4))}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Proceed for payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('3%'),
    backgroundColor: '#fff'
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  header: {
    fontSize: RFValue(17),
    fontWeight: 'bold',
    alignSelf: 'center',
    marginVertical: 0,
  },
  label: {
    marginTop: hp('1%'),
    marginBottom: hp('0.3%'),
    fontSize: RFValue(12),
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('1%'),
    padding: hp('1%'),
    fontSize: RFValue(13),
    backgroundColor: '#f9f9f9',
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    marginTop: hp('1%')
  },
  button: {
    backgroundColor: '#20546b',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('1%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: RFValue(13)
  }
});

export default CardScreen;
