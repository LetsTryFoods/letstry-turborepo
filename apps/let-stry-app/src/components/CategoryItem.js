// import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";

// const CategoryItem = ({ category, isSelected, onSelect }) => {
//   if (!category || typeof category !== "string") {
//     console.error("Invalid category passed to CategoryItem:", category);
//     return null;
//   }

//   const getCategoryImage = () => {
//     const imageMap = {
//       "All Products": require("../assets/categories/withoutbackground/all.png"),
//       "Newly Added": require("../assets/categories/withoutbackground/newly_added.png"),
//       "Purani Delhi": require("../assets/categories/withoutbackground/purani_delhi.png"),
//       "Indian Sweets": require("../assets/categories/withoutbackground/indian_sweets.png"),
//       "Healthy Snacks": require("../assets/categories/withoutbackground/healthy_snacks.png"),
//       "Bhujia": require("../assets/categories/withoutbackground/bhujia.png"),
//       "Cookies": require("../assets/categories/withoutbackground/cookies.png"),
//       "Rusk": require("../assets/categories/withoutbackground/rusk.png"),
//       "Cake & Muffins": require("../assets/categories/withoutbackground/cakes.png"),
//       "Munchies": require("../assets/categories/withoutbackground/munchies.png"),
//       "Fasting Special": require("../assets/categories/withoutbackground/fasting_special.png"),
//       "Pratham": require("../assets/categories/withoutbackground/pratham.png"),
//       "Chips n Crisps": require("../assets/categories/withoutbackground/chips_crisps.png"),
//       "South Range": require("../assets/categories/withoutbackground/south_range.png"),
//     };

//     return imageMap[category] || require("../assets/images/default_category.png");
//   };

//   return (
//     <View style={styles.outerContainer}>
//       <TouchableOpacity
//         style={styles.container}
//         onPress={() => onSelect?.(category)}
//         activeOpacity={0.8}
//       >
//         <View style={[styles.imageContainer, isSelected && styles.selectedImageContainer]}>
//           <Image
//             source={getCategoryImage()}
//             style={styles.image}
//             resizeMode="contain"
//           />
//         </View>
//         <Text 
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           style={[styles.text, isSelected && styles.selectedText]}
//         >
//           {category}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   outerContainer: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   container: {
//     alignItems: "center",
//     marginVertical: 3,
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//     width: '90%',
//   },
//   imageContainer: {
//     backgroundColor: 'rgba(182,209,211,0.73)',
//     borderRadius: 10,
//     padding: 5,
//     marginBottom: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: 'transparent',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0,
//     shadowRadius: 0,
//     elevation: 0,
//   },
//   selectedImageContainer: {
//     backgroundColor: '#0C5273',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//     padding: 8,
//   },
//   image: {
//     width: 60,
//     height: 50,
//     opacity: 1,
//   },
//   text: {
//     marginTop: 2,
//     fontSize: 8,
//     fontWeight: "500",
//     color: "#444",
//     textAlign: "center",
//   },
//   selectedText: {
//     fontWeight: "700",
//     color: "#345678",
//   },
// });

// export default CategoryItem;










import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const CategoryItem = ({ category, isSelected, onSelect }) => {
  // Basic validation to prevent crashes if the category prop is invalid
  if (!category || typeof category !== "string") {
    console.error("Invalid category passed to CategoryItem:", category);
    return null;
  }

  // A map to associate category names with their image assets
  const getCategoryImage = () => {
    const imageMap = {
      "All Products": require("../assets/categories/withoutbackground/all.png"),
      "Newly Added": require("../assets/categories/withoutbackground/newly_added.png"),
      "Purani Delhi": require("../assets/categories/withoutbackground/purani_delhi.png"),
      "Indian Sweets": require("../assets/categories/withoutbackground/indian_sweets.png"),
      "Healthy Snacks": require("../assets/categories/withoutbackground/healthy_snacks.png"),
      "Bhujia": require("../assets/categories/withoutbackground/bhujia.png"),
      "Cookies": require("../assets/categories/withoutbackground/cookies.png"),
      "Rusk": require("../assets/categories/withoutbackground/rusk.png"),
      "Cake & Muffins": require("../assets/categories/withoutbackground/cakes.png"),
      "Munchies": require("../assets/categories/withoutbackground/munchies.png"),
      "Fasting Special": require("../assets/categories/withoutbackground/fasting_special.png"),
      "Pratham": require("../assets/categories/withoutbackground/pratham.png"),
      "Chips n Crisps": require("../assets/categories/withoutbackground/chips_crisps.png"),
      "South Range": require("../assets/categories/withoutbackground/south_range.png"),
    };

    // Return the correct image or a default one if not found
    return imageMap[category] || require("../assets/images/default_category.png");
  };

  return (
    // This outer container is useful if you want to set a specific width
    // for each item in a FlatList, e.g., style={{ width: wp('25%') }}
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => onSelect?.(category)}
        activeOpacity={0.8}
      >
        <View style={[styles.imageContainer, isSelected && styles.selectedImageContainer]}>
          <Image
            source={getCategoryImage()}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text
          allowFontScaling={false}
          style={[styles.text, isSelected && styles.selectedText]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// All styles are now responsive using wp, hp, and RFValue
const styles = StyleSheet.create({
  outerContainer: {
    // This allows the item to be flexible. Set the width in your FlatList's renderItem style.
    // For example, if you want 4 items per row, you'd set width to wp('25%').
    // alignItems: 'center' ensures the content inside is centered.
    paddingHorizontal: wp('1%'),
    alignItems: 'center',
  },
  container: {
    alignItems: "center",
    marginVertical: hp('0.5%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('3%'),
    width: '100%', // Takes the full width of its parent (outerContainer)
  },
  imageContainer: {
    width: wp('18%'),  // Responsive width
    height: wp('16%'), // Responsive height, same as width for a square look
    borderRadius: wp('3%'),
    backgroundColor: '#E7E8E8',
    padding: wp('1%'),
    marginBottom: hp('0.8%'),
    alignItems: 'center',
    justifyContent: 'center',
    // Removed fixed shadows for a cleaner default state
    elevation: 0,
  },
  selectedImageContainer: {
    backgroundColor: '#0C5273',
    // Apply elevation and shadow for the selected state to make it pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: wp('1.5%'), // Slightly more padding when selected
  },
  image: {
    // Image will fill the container, respecting aspect ratio due to 'contain'
    width: '100%',
    height: '100%',
  },
  text: {
    // RFValue makes font size responsive. 10 is a good base size.
    fontSize: RFValue(8),
    fontWeight: "500",
    color: "#444",
    textAlign: "center",
    // Adding a fixed height and using flexbox helps align text consistently
    // especially for category names with different lengths (e.g., "Rusk" vs "Fasting Special")
    //height: hp('4%'),
  },
  selectedText: {
    fontWeight: "700",
    color: "#0C5273", // Using a color that matches the selected background
  },
});

export default CategoryItem;