import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { wp, hp, RFValue, getImageUrl } from '../../../lib/utils/ui-utils';

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
}

interface CategoriesGridProps {
  categories: Category[];
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop By Categories</Text>
        <TouchableOpacity onPress={() => router.push('/categories' as any)}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {categories.slice(0, 9).map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.item}
            onPress={() => router.push({
              pathname: '/categories' as any,
              params: { categoryId: category.id }
            })}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: getImageUrl(category.imageUrl) }} 
                style={styles.image} 
                contentFit="contain" 
              />
            </View>
            <Text 
              allowFontScaling={false} 
              style={styles.name} 
              numberOfLines={2}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp('1.5%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4.6%'),
    marginBottom: hp('1.5%'),
  },
  title: {
    fontSize: RFValue(17),
    fontWeight: 'bold',
    color: '#222',
  },
  seeAll: {
    fontSize: RFValue(13),
    color: '#0C5273',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Use flex-start for consistent 3-column spacing
    paddingHorizontal: wp('2.5%'),
  },
  item: {
    width: wp('31.5%'), // Width for 3 columns with padding
    marginBottom: hp('2%'),
    alignItems: 'center',
  },
  imageContainer: {
    width: wp('26%'),
    aspectRatio: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: RFValue(10),
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    paddingHorizontal: wp('1%'),
  },
});

export default CategoriesGrid;
