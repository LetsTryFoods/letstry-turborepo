import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { wp, hp, RFValue, getImageUrl } from '../../../lib/utils/ui-utils';
import { theme } from '../../../styles/theme';

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategoryId: string;
  onCategorySelect: (id: string) => void;
}

const ALL_PRODUCTS_ID = 'all';
const ITEM_HEIGHT = 140; // Estimated height for getItemLayout

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategoryId,
  onCategorySelect,
}) => {
  const listRef = useRef<FlatList>(null);

  // Add "All Products" to the list
  const displayCategories = [
    { 
      id: ALL_PRODUCTS_ID, 
      name: 'All Products', 
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png'
    },
    ...categories,
  ];

  // Auto-scroll to active category
  useEffect(() => {
    if (displayCategories.length > 0) {
      const index = displayCategories.findIndex(item => item.id === activeCategoryId);
      if (index !== -1 && listRef.current) {
        listRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }
    }
  }, [activeCategoryId, displayCategories]);

  const renderItem = ({ item }: { item: any }) => {
    const isActive = activeCategoryId === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.item, isActive && styles.activeItem]}
        onPress={() => onCategorySelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
          {item.imageUrl ? (
            <Image
              source={{ uri: getImageUrl(item.imageUrl) }}
              style={styles.icon}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderIcon} />
          )}
        </View>
        <Text
          style={[styles.label, isActive && styles.activeLabel]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={displayCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        // Prevent scroll crash if index not found immediately
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp('28%'),
    backgroundColor: '#FFFFFF', // Pure white background
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  item: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 4,
  },
  activeItem: {
    backgroundColor: '#FFF9EB', // Very light golden tint for active row
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F5F5F5', // Very faint border
  },
  activeIconContainer: {
    backgroundColor: '#FFFFFF',
    // Lift active item slightly with shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 76,
    height: 76,
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  label: {
    fontSize: RFValue(9.5),
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
    paddingHorizontal: 2,
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default CategorySidebar;
