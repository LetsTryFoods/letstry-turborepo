import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { wp, hp, RFValue } from '../../../lib/utils/ui-utils';
import ProductCard from '../../../components/common/ProductCard';

interface HorizontalSectionProps {
  title: string;
  products: any[];
  seeAllPath?: string;
  loading?: boolean;
}

const CARD_GAP = wp('2%');

const HorizontalSection: React.FC<HorizontalSectionProps> = ({ 
  title, 
  products, 
  seeAllPath,
  loading 
}) => {
  const router = useRouter();

  if (!loading && products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {seeAllPath && (
          <TouchableOpacity onPress={() => router.push(seeAllPath as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={{ marginHorizontal: CARD_GAP / 2 }}>
            <ProductCard 
              product={item} 
              style={{ width: wp('44%'), height: hp('38%') }}
              imageStyle={{ height: hp('20%') }}
              onPress={() => router.push(`/product/${item.slug}` as any)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: hp('1%'),
    marginBottom: hp('3.5%'), // Increased bottom gap
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4.6%'),
    marginBottom: hp('1.5%'),
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#222',
  },
  seeAll: {
    fontSize: RFValue(13),
    color: '#0C5273',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: wp('4%') - CARD_GAP / 2,
  },
});

export default HorizontalSection;
