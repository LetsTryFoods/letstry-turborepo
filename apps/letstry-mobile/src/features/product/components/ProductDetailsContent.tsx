import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { ProductDetails, ProductVariant } from '../types';
import { RFValue, wp } from '../../../lib/utils/ui-utils';
import DietaryBadges from './DietaryBadges';
import VariantSelector from './VariantSelector';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  product: ProductDetails;
  selectedVariant: ProductVariant;
  setSelectedVariant: (variant: ProductVariant) => void;
}

const ProductDetailsContent: React.FC<Props> = ({ product, selectedVariant, setSelectedVariant }) => {
  const { width } = useWindowDimensions();
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const toggleDescription = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDescExpanded(!isDescExpanded);
  };

  const tagsStyles = {
    body: {
      color: '#444',
      fontSize: RFValue(12.5),
      lineHeight: RFValue(19),
    },
    p: {
      marginBottom: 10,
    },
    ul: {
      marginBottom: 10,
      paddingLeft: 10,
    },
    li: {
      marginBottom: 5,
    },
    strong: {
      fontWeight: 'bold',
      color: '#222',
    },
  };

  return (
    <View style={styles.container}>
      {/* Product Info Header */}
      <View style={styles.mainInfo}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.weightRow}>
          <Text style={styles.weight}>{selectedVariant.weight}{selectedVariant.weightUnit}</Text>
        </View>

        <DietaryBadges 
          isVegetarian={product.isVegetarian} 
          isGlutenFree={product.isGlutenFree} 
        />

        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{selectedVariant.price}</Text>
            {selectedVariant.mrp > selectedVariant.price && (
              <Text style={styles.mrp}>₹{selectedVariant.mrp}</Text>
            )}
          </View>
          {selectedVariant.discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{selectedVariant.discountPercent}% OFF</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.sectionDivider} />

      {/* Variant Selector */}
      <View style={styles.section}>
        <VariantSelector 
          variants={product.variants} 
          selectedVariant={selectedVariant} 
          onSelect={setSelectedVariant} 
        />
      </View>

      <View style={styles.sectionDivider} />

      {/* Collapsible Description - Blinkit Style */}
      <TouchableOpacity 
        style={styles.collapsibleHeader} 
        onPress={toggleDescription}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.sectionTitle}>Product Details</Text>
          {!isDescExpanded && (
            <Text style={styles.seeMoreText}>View description, ingredients & more</Text>
          )}
        </View>
        <Ionicons 
          name={isDescExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      {isDescExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Description</Text>
            {product.description ? (
              <RenderHtml
                contentWidth={width - wp('12%')}
                source={{ html: product.description }}
                tagsStyles={tagsStyles as any}
                baseStyle={tagsStyles.body as any}
              />
            ) : (
              <Text style={styles.bodyText}>Healthy and delicious snack from Let's Try.</Text>
            )}
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Ingredients</Text>
            <Text style={styles.bodyText}>{product.ingredients}</Text>
          </View>

          {product.allergens && (
            <View style={styles.subSection}>
              <Text style={styles.subTitle}>Allergen Information</Text>
              <Text style={styles.bodyText}>{product.allergens}</Text>
            </View>
          )}

          <View style={styles.footerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shelf Life</Text>
              <Text style={styles.infoValue}>{product.shelfLife}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SKU</Text>
              <Text style={styles.infoValue}>{selectedVariant.sku}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.sectionDivider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  mainInfo: {
    padding: wp('5%'),
    paddingTop: 10,
  },
  brand: {
    fontSize: RFValue(11),
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: RFValue(17),
    fontWeight: '800',
    color: '#111',
    lineHeight: RFValue(22),
  },
  weightRow: {
    marginTop: 4,
  },
  weight: {
    fontSize: RFValue(12),
    color: '#666',
    fontWeight: '500',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: RFValue(18),
    fontWeight: '800',
    color: '#000',
  },
  mrp: {
    fontSize: RFValue(13),
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#3A86FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: RFValue(9),
    fontWeight: '800',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F4F4F4',
  },
  section: {
    paddingHorizontal: wp('5%'),
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('5%'),
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#222',
  },
  seeMoreText: {
    fontSize: RFValue(11),
    color: '#3A86FF',
    marginTop: 2,
    fontWeight: '500',
  },
  expandedContent: {
    paddingHorizontal: wp('6%'),
    paddingBottom: 20,
  },
  subSection: {
    marginBottom: 15,
  },
  subTitle: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bodyText: {
    fontSize: RFValue(12),
    color: '#555',
    lineHeight: RFValue(18),
  },
  footerInfo: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 15,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: RFValue(11),
    color: '#999',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: RFValue(11),
    color: '#333',
    fontWeight: '600',
  },
});

export default ProductDetailsContent;
