import { TouchableOpacity, View, Text, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from 'react-native-vector-icons/Ionicons';

const SearchBar = ({ placeholder = "Search products", searchText = "", setSearchText = null }) => {
  const navigation = useNavigation()

  const handlePress = () => {
    navigation.navigate("Search", { initialQuery: searchText || "" })
  }

  return (
    <TouchableOpacity style={styles.searchBar} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
      <Text 
        allowFontScaling={false}
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.searchText, !searchText && styles.placeholder]}
      >
        {searchText || placeholder}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholder: {
    color: "#999",
  },
})

export default SearchBar