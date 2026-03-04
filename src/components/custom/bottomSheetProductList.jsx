import React from "react";
import { useEffect, useMemo } from "react";
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
  // PermissionsAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useMutation, useLazyQuery } from "@apollo/client/react";

import { ORDER_LINE_ADD } from "../../graphql/Mutation";
import { ORDER_DETAILS_WITH_METADATA } from "../../graphql/Query";
import { useState } from "react";
import { toast } from "sonner-native";
import ScreenLayout from "../../screens/app/ScreenLayout";
import { debounce } from "lodash";
import { colors } from "../../constant/Colors";
// import Voice from "@react-native-voice/voice";
import { useTheme } from "../../constant/ThemeContext";

const userStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        flexGrow: 1,
        backgroundColor: theme.background, // Zinc 950
      },
      subtitle: {
        fontSize: 13,
        color: theme.secondary, // Zinc 400 (Muted)
        marginVertical: 8,
      },

      // --- SEARCH BAR ---
      searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.primary, // Zinc 900
        borderWidth: 1,
        borderColor: theme.border, // Zinc 800
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 10 : 4,
      },
      searchInput: {
        flex: 1,
        paddingHorizontal: 8,
        color: theme.text, // Zinc 50
        fontSize: 15,
      },
      voiceButton: {
        padding: 8,
        marginLeft: 5,
        zIndex: 1,
      },

      // --- PRODUCT CARDS ---
      productCard: {
        backgroundColor: theme.primary, // Zinc 900
        borderWidth: 1,
        borderColor: theme.border, // Zinc 800
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
        backgroundColor: theme.border, // Zinc 800
        justifyContent: "center",
        alignItems: "center",
      },
      productName: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.heading, // White
      },
      productLocal: {
        fontSize: 12,
        color: theme.secondary, // Muted
      },
      variantRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: theme.border, // Zinc 800
      },
      price: {
        fontWeight: "600",
        color: theme.text,
        fontSize: 14,
      },

      // --- FOOTER & BUTTONS ---
      footer: {
        backgroundColor: theme.primary,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 16,
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
        backgroundColor: theme.textSecondary, // White Background (Inverted)
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      },
      confirmButtonText: {
        color: theme.background, // Black Text on White Button
        fontSize: 16,
        fontWeight: "700",
      },

      // --- VOICE/RECORDING ---
      recordingIndicator: {
        backgroundColor: "rgba(239, 68, 68, 0.15)", // Subtle Red tint
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: theme.error,
      },
      recordingText: {
        color: theme.error, // Red-500
        textAlign: "center",
        fontWeight: "500",
        fontSize: 13,
      },
    });
  }, [theme]);
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
  const [hasRecordPermission, setHasRecordPermission] = useState(false);
  const { theme } = useTheme();
  // Debounce the search input
  const debouncedSearch = useMemo(
    () => debounce(onSearchChange, 200),
    [onSearchChange]
  );
  const styles = userStyle(theme);
  const startVoiceRecognition = async () => {};

  const stopVoiceRecognition = async () => {
    // try {
    //   await Voice.stop();
    //   setIsRecording(false);
    // } catch (error) {
    //   // console.log("Stop error:", error);
    //   setIsRecording(false); // Ensure we set recording to false even on error
    // }
  };
  const handleSearchChange = (text) => {
    setLocalSearch(text);
    debouncedSearch(text);
  };

  // Sync with parent's search query
  useEffect(() => {
    setLocalSearch(currentSearch || "");
  }, [currentSearch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const [
    orderLineAddMutation,
    { loading: orderLineAdding, error: orderLineAddError },
  ] = useMutation(ORDER_LINE_ADD);

  const [fetchOrderDetails] = useLazyQuery(ORDER_DETAILS_WITH_METADATA);

  const confirmOrderList = async () => {
    try {
      await orderLineAddMutation({
        variables: {
          id: order_id,
          input: selectedVariants,
        },
      });
      const orderDetailWithMetaData = await fetchOrderDetails({
        variables: { id: order_id },
      });
      receiveMetaData(orderDetailWithMetaData?.data?.order?.lines);
    } catch (err) {
      toast.error("orderLineAddError", err);
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

  const ProductImage = ({ product }) => {
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScreenLayout paddingHorizontal={5}>
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
            <TouchableOpacity
              onPressIn={startVoiceRecognition}
              onPressOut={stopVoiceRecognition}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={styles.voiceButton}
            >
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

        {orderLineAddError && (
          <Text style={{ color: "red" }}>
            {toast.error("Order not added", orderLineAddError.message)}
          </Text>
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
                <ProductImage product={product} />
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
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmOrderList}
            style={[
              styles.confirmButton,
              (selectedVariants.length === 0 || orderLineAdding) && {
                backgroundColor: "#ccc",
              },
            ]}
            disabled={selectedVariants.length === 0 || orderLineAdding}
          >
            <Text style={styles.confirmButtonText}>
              {orderLineAdding ? "Adding..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    </TouchableWithoutFeedback>
  );
};
export default React.memo(BottomSheetProductListContent);
