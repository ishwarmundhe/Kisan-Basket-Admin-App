import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useMutation, useLazyQuery } from "@apollo/client/react";

import { ORDER_LINE_ADD } from "../../graphql/Mutation";
import { ORDER_DETAILS_WITH_METADATA } from "../../graphql/Query";
import { toast } from "sonner-native";
import ScreenLayout from "../../screens/app/ScreenLayout";
import { debounce } from "lodash";
import { colors } from "../../constant/Colors";
import { useTheme } from "../../constant/ThemeContext";

const useLocalStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        flexGrow: 1,
        backgroundColor: theme.background,
      },
      subtitle: {
        fontSize: 13,
        color: theme.secondary,
        marginVertical: 8,
      },
      searchContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.primary,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 10 : 4,
        minHeight: 44,
      },
      searchInput: {
        flex: 1,
        paddingHorizontal: 8,
        color: theme.text,
        fontSize: 15,
      },
      voiceButton: {
        padding: 8,
        marginLeft: 5,
        zIndex: 1,
      },
      productCard: {
        backgroundColor: theme.primary,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        padding: 12,
        marginVertical: 6,
      },
      productHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      },
      productImage: {
        width: 44,
        height: 44,
        borderRadius: 6,
        marginRight: 10,
        backgroundColor: theme.background,
      },
      fallbackImage: {
        width: 44,
        height: 44,
        borderRadius: 6,
        marginRight: 10,
        backgroundColor: theme.border,
        justifyContent: "center",
        alignItems: "center",
      },
      productName: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.heading,
      },
      productLocal: {
        fontSize: 12,
        color: theme.secondary,
      },
      variantRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: theme.border,
      },
      price: {
        fontWeight: "600",
        color: theme.text,
        fontSize: 14,
      },
      footer: {
        backgroundColor: theme.primary,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 12,
        paddingBottom: Platform.OS === "ios" ? 24 : 16,
        borderTopWidth: 1,
        borderTopColor: theme.border,
      },
      backButton: {
        flex: 1,
        backgroundColor: theme.primary,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        padding: 12,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
      },
      backButtonText: {
        fontWeight: "600",
        color: theme.text,
      },
      confirmButton: {
        flex: 1,
        backgroundColor: theme.textSecondary,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      },
      confirmButtonText: {
        color: theme.background,
        fontSize: 16,
        fontWeight: "700",
      },
      recordingIndicator: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: theme.error,
      },
      recordingText: {
        color: theme.error,
        textAlign: "center",
        fontWeight: "500",
        fontSize: 13,
      },
    });
  }, [theme]);
};

// Extracted outside to prevent re-mounting bugs
const ProductImage = ({ product, theme, styles }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !product?.node?.media?.[0]?.url) {
    return (
      <View style={styles.fallbackImage}>
        <Ionicons name="image-outline" size={24} color={theme.text} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: product.node.media[0].url }}
      style={styles.productImage}
      onError={() => setImageError(true)}
      resizeMode="contain"
    />
  );
};

const BottomSheetProductListContent = ({
  list,
  order_id,
  receiveMetaData,
  CancelBottomSheet,
  onSearchChange,
  currentSearch,
  loading,
}) => {
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [localSearch, setLocalSearch] = useState(currentSearch || "");
  const [isRecording, setIsRecording] = useState(false);

  // NEW: Manual processing state to cover both the mutation and the refetch
  const [isProcessing, setIsProcessing] = useState(false);

  const { theme } = useTheme();
  const styles = useLocalStyle(theme);

  const debouncedSearch = useMemo(
    () => debounce(onSearchChange, 200),
    [onSearchChange],
  );

  const handleSearchChange = (text) => {
    setLocalSearch(text);
    debouncedSearch(text);
  };

  useEffect(() => {
    setLocalSearch(currentSearch || "");
  }, [currentSearch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const [orderLineAddMutation] = useMutation(ORDER_LINE_ADD);
  const [fetchOrderDetails] = useLazyQuery(ORDER_DETAILS_WITH_METADATA);

  const confirmOrderList = async () => {
    if (selectedVariants.length === 0) return;

    setIsProcessing(true);

    try {
      const { data: addData } = await orderLineAddMutation({
        variables: {
          id: order_id,
          input: selectedVariants,
        },
      });

      if (addData?.orderLinesCreate?.errors?.length > 0) {
        throw new Error(addData.orderLinesCreate.errors[0].message);
      }

      const orderDetailWithMetaData = await fetchOrderDetails({
        variables: { id: order_id },
        fetchPolicy: "network-only",
      });

      setSelectedVariants([]);
      receiveMetaData(orderDetailWithMetaData?.data?.order?.lines);
    } catch (err) {
      toast.error(err.message || "Failed to add products");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVariant = (variantId) => {
    setSelectedVariants((prev) => {
      const exists = prev.find((v) => v.variantId === variantId);
      if (exists) {
        return prev.filter((v) => v.variantId !== variantId);
      } else {
        return [...prev, { variantId, quantity: 1 }];
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product name or SKU"
            value={localSearch}
            onChangeText={handleSearchChange}
            placeholderTextColor={theme.text}
          />
          {localSearch ? (
            <TouchableOpacity
              onPress={() => {
                handleSearchChange("");
                setLocalSearch("");
              }}
            >
              <Ionicons name="close-outline" size={20} color="#999" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.voiceButton}>
              <Ionicons
                name={isRecording ? "mic" : "mic-outline"}
                size={20}
                color={isRecording ? "red" : "#999"}
              />
            </TouchableOpacity>
          )}
        </View>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.recordingText}>
              {Platform.OS === "ios" ? "Listening... Speak now" : "Speak now"}
            </Text>
          </View>
        )}

        {list?.length === 0 && (
          <Text
            style={{
              textAlign: "center",
              marginVertical: 10,
              color: theme.text,
            }}
          >
            No products match your search.
          </Text>
        )}

        {loading && (
          <View style={{ marginVertical: 20 }}>
            <ActivityIndicator size="large" />
          </View>
        )}

        <FlatList
          data={list || []}
          keyExtractor={(item) => item?.node?.id}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: product }) => (
            <View key={product.node?.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <ProductImage product={product} theme={theme} styles={styles} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{product.node?.name}</Text>
                  {product.nameLocal && (
                    <Text style={styles.productLocal}>{product.nameLocal}</Text>
                  )}
                </View>
              </View>
              {product?.node?.variants?.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={styles.variantRow}
                  onPress={() => toggleVariant(variant.id)}
                >
                  <Ionicons
                    name={
                      selectedVariants.some((v) => v.variantId === variant.id)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color={theme.text}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: colors.HEADING_COLOR }}>
                      {variant.name}
                    </Text>
                  </View>
                  <Text style={styles.price}>
                    ₹{variant?.pricing?.price?.gross?.amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={CancelBottomSheet}
            disabled={isProcessing}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmOrderList}
            style={[
              styles.confirmButton,
              (selectedVariants.length === 0 || isProcessing) && {
                backgroundColor: "#ccc",
              },
            ]}
            disabled={selectedVariants.length === 0 || isProcessing}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? "Adding..." : "Add To Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default React.memo(BottomSheetProductListContent);
