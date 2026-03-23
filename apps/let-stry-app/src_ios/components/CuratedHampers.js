import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage as rf } from 'react-native-responsive-fontsize';

// A single card for the hamper
const HamperCard = ({ item }) => {
  const imageUrl = item.image_1_url ? { uri: item.image_1_url, priority: FastImage.priority.normal } : require("../assets/categories/indian_sweets.png");
  const discountPercentage = item.mrp > 0 ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;

  return (
    <View style={styles.cardContainer}>
      <FastImage source={imageUrl} style={styles.cardImage} resizeMode={FastImage.resizeMode.cover} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name || 'Gourmet Hamper'}</Text>
        <Text style={styles.cardWeight}>{item.weight || '640 gm'}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.discount}>{discountPercentage}% OFF</Text>
          <Text style={styles.currentPrice}>₹{item.price}</Text>
          <Text style={styles.originalPrice}>₹{item.mrp}</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// The main component for the entire section
const CuratedHampers = () => {
  const [hampers, setHampers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHampers = async () => {
      try {
        const response = await fetch('https://api.letstryfoods.com/api/foods');
        const data = await response.json();
        // Filters for hampers which seem to have category_id 15
        const filteredHampers = data.foods.filter(food => food.category_id === 15);
        setHampers(filteredHampers);
      } catch (error) {
        console.error("Failed to fetch hampers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHampers();
  }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#B22222" /></View>;
  }

  if (hampers.length === 0) {
    return null; // Don't show anything if no hampers are found
  }

  return (
    <ImageBackground
      // Make sure you have a background image at this path
      source={require('../assets/gold-background.gif')}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.mainTitle}>Curated Hampers</Text>
        <FlatList
          data={hampers}
          renderItem={({ item }) => <HamperCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>
    </ImageBackground>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  centered: { height: hp('30%'), justifyContent: 'center', alignItems: 'center' },
  backgroundContainer: { width: '100%', paddingVertical: hp('3%'), marginVertical: hp('2%') },
  overlay: { alignItems: 'center' },
  mainTitle: { fontSize: rf(3.5), fontWeight: 'bold', color: '#B22222', fontFamily: 'serif', marginBottom: hp('2.5%') },
  listContentContainer: { paddingHorizontal: wp('2%') },
  cardContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 15,
    width: wp('55%'),
    marginHorizontal: wp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: hp('18%') },
  cardContent: { padding: wp('3%'), alignItems: 'center' },
  cardTitle: { fontSize: rf(2), fontWeight: 'bold', color: '#333', marginBottom: hp('0.5%') },
  cardWeight: { fontSize: rf(1.6), color: '#757575', marginBottom: hp('1%') },
  priceContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: hp('1.5%') },
  discount: { fontSize: rf(1.6), fontWeight: 'bold', color: '#4CAF50', marginRight: wp('2%') },
  currentPrice: { fontSize: rf(2), fontWeight: 'bold', color: '#000', marginRight: wp('2%') },
  originalPrice: { fontSize: rf(1.6), color: '#757575', textDecorationLine: 'line-through' },
  addButton: { backgroundColor: '#004D40', borderRadius: 8, paddingVertical: hp('1.2%'), width: '100%', alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: rf(1.8), fontWeight: 'bold' },
});

export default CuratedHampers;