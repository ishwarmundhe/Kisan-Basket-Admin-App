import {
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import {
  GET_CATEGORIES,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCTS,
} from "../../../graphql/Query";
import React, { useEffect, useMemo, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenLayout from "../ScreenLayout";
import { colors } from "../../../constant/Colors";
import ErrorMessage from "../../../components/custom/errorMessage";
import { useLazyQuery, useQuery } from "@apollo/client/react";
import { useTheme } from "../../../constant/ThemeContext";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        searchContainer: {
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 8,
          paddingHorizontal: 12,
          marginVertical: 10,
          marginHorizontal: 10,
          borderColor: theme.border,
          borderWidth: 1,
        },
        searchIcon: {
          marginRight: 8,
        },
        searchInput: {
          flex: 1,
          fontSize: 16,
          color: theme.text,
          paddingVertical: 8,
        },
        categoryListContainer: {
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 10,
        },
        categoryListContent: {
          gap: 12,
          paddingHorizontal: 10,
          paddingVertical: 12,
        },
        categoryItem: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          borderColor: theme.border,
          borderWidth: 1,
          marginRight: 8,
        },
        selectedCategoryItem: {
          backgroundColor: theme.textSecondary,
          borderColor: theme.border,
        },
        categoryText: {
          color: theme.text,
          textAlign: "center",
        },
        selectedCategoryText: {
          color: theme.text,
          fontWeight: "500",
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        emptyContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        emptyText: {
          color: theme.text,
          fontSize: 16,
        },
        productListContent: {
          gap: 12,
          paddingHorizontal: 10,
          paddingBottom: 20,
        },
        productColumnWrapper: {
          justifyContent: "space-between",
          gap: 12,
        },
        productCard: {
          flex: 1,
          backgroundColor: theme.primary,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: "hidden",
          maxWidth: "48%",
        },
        productImage: {
          width: "100%",
          height: 160,
        },
        imagePlaceholder: {
          width: "100%",
          height: 160,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.primary,
        },
        productInfo: {
          padding: 10,
        },
        productName: {
          fontWeight: "500",
          color: theme.text,
          marginBottom: 6,
        },
        productPrice: {
          color: theme.heading,
          fontWeight: "600",
        },
      }),
    [theme]
  );

const ProductListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { width } = Dimensions.get("screen");

  // Categories
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useQuery(GET_CATEGORIES);

  // All products
  const [
    fetchProducts,
    {
      data: productData,
      loading: productLoading,
      error: productError,
      refetch: refetchProducts,
    },
  ] = useLazyQuery(GET_PRODUCTS);

  // Products by category
  const [
    fetchProductsByCategory,
    { data: categoryProductData, loading: categoryProductLoading },
  ] = useLazyQuery(GET_PRODUCTS_BY_CATEGORY);

  // Fetch all initially
  useEffect(() => {
    fetchProducts();
  }, []);

  const styles = useStyle(theme);

  // Category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const variables = { search: searchQuery };
    if (categoryId) variables.categoryId = categoryId;

    if (categoryId) fetchProductsByCategory({ variables });
    else fetchProducts({ variables });
  };

  // Search
  const handleSearch = (text) => {
    setSearchQuery(text);
    const variables = { search: text };
    if (selectedCategory) variables.categoryId = selectedCategory;

    if (selectedCategory) fetchProductsByCategory({ variables });
    else fetchProducts({ variables });
  };

  const displayedProducts = useMemo(() => {
    return selectedCategory
      ? categoryProductData?.products?.edges || []
      : productData?.products?.edges || [];
  }, [productData, categoryProductData, selectedCategory]);

  const isLoading = categoryLoading || productLoading || categoryProductLoading;
  const hasError = categoryError || productError;

  const renderProductItem = ({ item }) => {
    const imageUrl = item.node.images?.[0]?.url;
    const productName = item.node.name || "Unnamed Product";
    const productPrice = item.node.pricing?.priceRange?.start?.gross;

    return (
      <TouchableOpacity style={styles.productCard}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={theme.text} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text
            style={styles.productName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {productName}
          </Text>
          {productPrice && (
            <Text style={styles.productPrice}>
              {productPrice.amount} {productPrice.currency}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }) => {
    const isSelected = item.node?.id === selectedCategory;
    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
        onPress={() => handleCategorySelect(item.node?.id)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.selectedCategoryText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.node?.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (hasError) return <ErrorMessage errorMessage={hasError.message} />;

  return (
    <ScreenLayout>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={theme.text}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Categories List */}
      <View style={styles.categoryListContainer}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            !selectedCategory && styles.selectedCategoryItem,
          ]}
          onPress={() => handleCategorySelect(null)}
        >
          <Text
            style={[
              styles.categoryText,
              !selectedCategory && styles.selectedCategoryText,
            ]}
          >
            All Products
          </Text>
        </TouchableOpacity>

        <FlatList
          data={categoryData?.categories?.edges || []}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.node.id}
        />
      </View>

      {/* Product Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      ) : displayedProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          numColumns={2}
          data={displayedProducts}
          keyExtractor={(item) => item.node.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productListContent}
          columnWrapperStyle={styles.productColumnWrapper}
          renderItem={renderProductItem}
          refreshing={isLoading}
          onRefresh={() => {
            if (selectedCategory)
              refetchProducts({ categoryId: selectedCategory });
            else refetchProducts();
          }}
        />
      )}
    </ScreenLayout>
  );
};

export default ProductListScreen;
