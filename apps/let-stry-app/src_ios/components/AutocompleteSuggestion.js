import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from "react-native";

const AutocompleteSuggestions = ({
  suggestions = [],
  onSelectSuggestion,
  highlight = "",
  maxSuggestions = 8,
}) => {
  // Helper to highlight matched text as in screenshot
  const highlightText = (text) => {
    if (!highlight) return <Text style={styles.suggestionText} allowFontScaling={false} adjustsFontSizeToFit>{text}</Text>;
    const regex = new RegExp(`(${highlight})`, "i");
    const parts = text.split(regex);
    return (
      <Text style={styles.suggestionText} allowFontScaling={false} adjustsFontSizeToFit>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <Text key={idx} style={styles.suggestionHighlight} allowFontScaling={false} adjustsFontSizeToFit>
              {part}
            </Text>
          ) : (
            <Text key={idx} style={styles.suggestionRest} allowFontScaling={false} adjustsFontSizeToFit>
              {part}
            </Text>
          )
        )}
      </Text>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionRow}
      onPress={() => onSelectSuggestion(item)}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholderImage} />
      )}
      {highlightText(item.name)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.dropdown}>
      <FlatList
        data={suggestions.slice(0, maxSuggestions)}
        keyExtractor={(item, idx) =>
          (item.ean_code || item.eanCode || item.value || idx).toString()
        }
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#fff", 
    borderRadius: 14,
    marginHorizontal: 0,
    marginTop: 2,
    paddingVertical: 0,
    maxHeight: 320,
    zIndex: 100,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  productImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F4F4F4",
  },
  placeholderImage: {
    width: 32,
    height: 32,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  suggestionText: {
    fontSize: 17,
    color: "#222",
    fontWeight: "400",
    flexShrink: 1,
  },
  suggestionHighlight: {
    color: "#222",
    fontWeight: "bold",
  },
  suggestionRest: {
    color: "#888",
    fontWeight: "400",
  },
});

export default AutocompleteSuggestions;