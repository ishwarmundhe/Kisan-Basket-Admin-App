import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, Image } from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";
import { useTheme } from "../../../constant/ThemeContext";
import ScreenLayout from "../ScreenLayout";
import { CHANNEL } from "@env";

import { WAREHOUSE_LIST, GET_PRODUCT_WITH_STOCKS } from "../../../graphql/Query";
import { UPDATE_VARIANT_STOCK } from "../../../graphql/Mutation";

export default function StockManagementDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { theme } = useTheme();

  const [expandedVariantId, setExpandedVariantId] = useState(null);
  const [stockInputs, setStockInputs] = useState({});

  // Fetch product data & warehouses
  const { data: productData, loading: productLoading, refetch } = useQuery(GET_PRODUCT_WITH_STOCKS, {
    variables: { id: productId, channel: CHANNEL },
    fetchPolicy: "network-only",
  });

  const { data: warehouseData } = useQuery(WAREHOUSE_LIST);

  // Mutation
  const [updateStock, { loading: updating }] = useMutation(UPDATE_VARIANT_STOCK);

  const product = productData?.product;
  const warehouses = warehouseData?.warehouses?.edges || [];

  // Toggle Accordion
  const toggleVariant = (variant) => {
    if (expandedVariantId === variant.id) {
      setExpandedVariantId(null);
    } else {
      setExpandedVariantId(variant.id);

      // Pre-fill the local state with current stock values for this variant
      // Added safe chaining (?.) in case stocks array is null
      const currentStocks = {};
      warehouses.forEach(({ node: warehouse }) => {
        const existingStock = variant.stocks?.find(s => s.warehouse.id === warehouse.id);
        currentStocks[warehouse.id] = existingStock ? String(existingStock.quantity) : "0";
      });
      setStockInputs(currentStocks);
    }
  };

  const handleStockChange = (warehouseId, value) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setStockInputs(prev => ({ ...prev, [warehouseId]: numericValue }));
  };

  const handleSaveStock = async (variantId) => {
    try {
      // Prepare the payload for Saleor: [{ warehouse: "ID", quantity: 10 }]
      const stockPayload = Object.keys(stockInputs).map(warehouseId => ({
        warehouse: warehouseId,
        quantity: parseInt(stockInputs[warehouseId] || "0", 10),
      }));

      const { data } = await updateStock({
        variables: {
          variantId,
          stocks: stockPayload,
        }
      });

      const errors = data?.productVariantStocksUpdate?.errors || [];
      if (errors.length > 0) {
        toast.error(errors[0].message);
      } else {
        toast.success("Stock updated successfully!");
        refetch(); // Refresh data to show new stock
        setExpandedVariantId(null); // Close accordion
      }
    } catch (err) {
      toast.error("Failed to update stock");
      console.error(err);
    }
  };

  if (productLoading) {
    return (
      <ScreenLayout style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Product Header */}
        <View style={styles.headerContainer}>
          {product?.media?.[0]?.url ? (
            <Image source={{ uri: product.media[0].url }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, { backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={40} color={theme.secondary} />
            </View>
          )}
          <Text style={[styles.productName, { color: theme.text }]}>{product?.name}</Text>
          <Text style={[styles.productSubtitle, { color: theme.secondary }]}>
            {product?.variants?.length || 0} Variants Available
          </Text>
        </View>

        {/* Variants List (Accordion) */}
        {product?.variants?.map((variant) => {
          const isExpanded = expandedVariantId === variant.id;

          return (
            <View key={variant.id} style={[styles.variantCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {/* Accordion Header */}
              <TouchableOpacity
                style={styles.variantHeader}
                onPress={() => toggleVariant(variant)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.variantName, { color: theme.text }]}>{variant.name}</Text>
                  <Text style={[styles.variantSku, { color: theme.secondary }]}>SKU: {variant.sku}</Text>
                </View>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={theme.text} />
              </TouchableOpacity>

              {/* Accordion Body (Stock Editing) */}
              {isExpanded && (
                <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Manage Stock Levels</Text>

                  {warehouses.map(({ node: warehouse }) => (
                    <View key={warehouse.id} style={styles.warehouseRow}>
                      <Text style={[styles.warehouseName, { color: theme.secondary }]} numberOfLines={2}>
                        {warehouse.name}
                      </Text>

                      <View style={styles.stockInputContainer}>
                        <TextInput
                          style={[styles.stockInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                          keyboardType="number-pad"
                          value={stockInputs[warehouse.id]}
                          onChangeText={(val) => handleStockChange(warehouse.id, val)}
                          placeholder="0"
                          placeholderTextColor={theme.secondary}
                        />
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => handleSaveStock(variant.id)}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Stock</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  headerContainer: { alignItems: "center", marginBottom: 24 },
  productImage: { width: 100, height: 100, borderRadius: 12, marginBottom: 12 },
  productName: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  productSubtitle: { fontSize: 14, marginTop: 4 },

  variantCard: { borderWidth: 1, borderRadius: 12, marginBottom: 12, overflow: "hidden" },
  variantHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  variantName: { fontSize: 16, fontWeight: "600" },
  variantSku: { fontSize: 13, marginTop: 4 },

  expandedContent: { padding: 16, borderTopWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 16 },

  warehouseRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  warehouseName: { flex: 1, fontSize: 15, paddingRight: 12 },

  // FIXED: Wider container for large numbers like 10,000,000
  stockInputContainer: { width: 140 },

  // FIXED: Added right-alignment, padding, and slightly larger font for better UX
  stockInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "500",
  },

  // FIXED: Hardcoded to a vibrant green perfect for Dark Mode
  saveBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#10b981", // Emerald Green
  },
  saveBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
