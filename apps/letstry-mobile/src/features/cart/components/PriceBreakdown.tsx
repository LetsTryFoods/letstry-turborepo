import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue, wp } from '../../../lib/utils/ui-utils';
import { Ionicons } from '@expo/vector-icons';

interface PriceBreakdownProps {
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  estimatedTax: number;
  handlingCharge: number;
  grandTotal: number;
  totalItems: number;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  subtotal,
  discountAmount,
  shippingCost,
  estimatedTax,
  handlingCharge,
  grandTotal,
  totalItems,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.headerToggle} 
        activeOpacity={0.7}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View>
          <Text style={styles.heading}>Bill details</Text>
          {!isExpanded && (
            <Text style={styles.accessibilityText}>open to view the full order pricing detail</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {!isExpanded && (
            <Text style={styles.collapsedTotal}>₹{grandTotal.toFixed(0)}</Text>
          )}
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <>
          {/* Detailed Breakdown Rows */}
          <View style={styles.row}>
            <View style={styles.labelWithIcon}>
              <Ionicons name="document-text-outline" size={16} color="#666" style={styles.icon} />
              <Text style={styles.label}>Items total</Text>
            </View>
            <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.row}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="gift-outline" size={16} color="#0fa958" style={styles.icon} />
                <Text style={[styles.label, { color: '#0fa958' }]}>Total savings</Text>
              </View>
              <Text style={styles.valueDiscount}>-₹{discountAmount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.labelWithIcon}>
              <Ionicons name="bicycle-outline" size={16} color="#666" style={styles.icon} />
              <Text style={styles.label}>Delivery charge</Text>
            </View>
            {shippingCost > 0 ? (
              <Text style={styles.value}>₹{shippingCost.toFixed(2)}</Text>
            ) : (
              <Text style={styles.freeDelivery}>FREE</Text>
            )}
          </View>

          {handlingCharge > 0 && (
            <View style={styles.row}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="hand-right-outline" size={16} color="#666" style={styles.icon} />
                <Text style={styles.label}>Handling charge</Text>
              </View>
              <Text style={styles.value}>₹{handlingCharge.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Grand Total - Visible in expanded state */}
          <View style={styles.rowTotal}>
            <Text style={styles.labelTotal}>Grand total</Text>
            <Text style={styles.valueTotal}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.savingsFooter}>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsFooterText}>You saved ₹{discountAmount.toFixed(0)} on this order</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: wp('4%'),
    marginTop: wp('4%'),
  },
  headerToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedTotal: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_700Bold',
    color: '#000',
    marginRight: 8,
  },
  heading: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  accessibilityText: {
    fontSize: RFValue(9),
    fontFamily: 'Inter_400Regular',
    color: '#888',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: RFValue(12.5),
    fontFamily: 'Inter_400Regular',
    color: '#444',
  },
  value: {
    fontSize: RFValue(12.5),
    fontFamily: 'Inter_500Medium',
    color: '#000',
  },
  valueDiscount: {
    fontSize: RFValue(12.5),
    fontFamily: 'Inter_600SemiBold',
    color: '#0fa958',
  },
  freeDelivery: {
    fontSize: RFValue(12.5),
    fontFamily: 'Inter_600SemiBold',
    color: '#0fa958',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: wp('2%'),
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  labelTotal: {
    fontSize: RFValue(15),
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  valueTotal: {
    fontSize: RFValue(15),
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  savingsFooter: {
    backgroundColor: '#F1F9F1',
    marginTop: 16,
    marginHorizontal: -wp('4%'),
    marginBottom: -wp('4%'),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsFooterText: {
    fontSize: RFValue(11),
    fontFamily: 'Inter_600SemiBold',
    color: '#0fa958',
  },
});

export default PriceBreakdown;
