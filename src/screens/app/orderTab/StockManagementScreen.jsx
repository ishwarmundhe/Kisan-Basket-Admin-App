import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, Image } from "react-native";
import { useQuery } from "@apollo/client/react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../../constant/ThemeContext";
import ScreenLayout from "../ScreenLayout";
import { PRODUCT_LIST_QUERY } from "../../../graphql/Query";
import { CHANNEL } from "@env";
import { debounce } from "lodash";

export default function StockManagementScreen({ navigation }) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, loading, refetch } = useQuery(PRODUCT_LIST_QUERY, {
    variables: { first: 50, channel: CHANNEL, filter: { search: debouncedSearch } },
    fetchPolicy: "cache-and-network",
  });

  const handleSearch = useCallback(
    debounce((text) => setDebouncedSearch(text), 500),
    []
  );

  const renderProduct = ({ item }) => {
    const product = item.node;
    const imageUrl = product.media?.[0]?.url;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => navigation.navigate("StockManagementDetail", { productId: product.id })}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.border }]}>
            <Ionicons name="image-outline" size={24} color={theme.secondary} />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{product.name}</Text>
          <Text style={[styles.subtitle, { color: theme.secondary }]}>
            {product.variants?.length || 0} Variants
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout style={{ backgroundColor: theme.background }}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search products..."
            placeholderTextColor={theme.secondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
        </View>
      </View>

      {loading && !data ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data?.products?.edges || []}
          keyExtractor={(item) => item.node.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={() => refetch()}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16 },
  searchContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 12, borderRadius: 10, borderWidth: 1 },
  image: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  placeholderImage: { justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  subtitle: { fontSize: 13 },
});
