import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useContext } from "react";
import { AuthContext } from "../../../constant/AuthProvider";
import { toast } from "sonner-native";
import {
  SpecificDateData,
  SpcificDateRangeData,
  UpdatePurchasePrice,
  GenerateSpcificDatePdf,
} from "../../../axiosServices/services";
import { colors } from "../../../constant/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../constant/ThemeContext";
import RNFetchBlob from "react-native-blob-util";
const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 16,
      },
      header: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 10,
        color: theme.heading,
        marginTop: 10,
      },
      dateInput: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: theme.primary,
        justifyContent: "center",
      },
      datePickerStyle: {
        color: theme.text,
        fontWeight: "500",
      },
      dateSection: { marginBottom: 25 },
      dateHeader: {
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 6,
        color: theme.heading,
      },
      slotHeader: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
        color: theme.secondary,
      },
      card: {
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.primary,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
      },
      title: {
        fontWeight: "bold",
        fontSize: 16,
        color: theme.heading,
        marginBottom: 4,
      },
      subText: { fontSize: 13, color: theme.text, marginBottom: 2 },

      // Inputs Section
      inputsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        gap: 12,
      },
      inputWrapper: {
        flex: 1,
      },
      label: {
        marginBottom: 6,
        fontSize: 12,
        color: theme.secondary,
        fontWeight: "500",
      },
      inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 40,
        backgroundColor: theme.background,
      },
      dollar: { marginRight: 4, color: theme.text, fontSize: 14 },
      input: {
        flex: 1,
        paddingVertical: 0, // Fix alignment on Android
        fontSize: 14,
        color: theme.text,
        height: "100%",
      },

      // Buttons
      updateBtn: {
        backgroundColor: theme.primary,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center",
        justifyContent: "center",
      },
      updateBtnText: {
        color: theme.background, // Inverted text color
        fontWeight: "600",
      },
      downloadBtn: {
        backgroundColor: theme.primary,
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginVertical: 16,
      },
      applyBtn: {
        backgroundColor: theme.primary,
        padding: 14,
        borderRadius: 10,
        marginVertical: 15,
        alignItems: "center",
      },
      btnText: {
        color: theme.background,
        fontWeight: "600",
        fontSize: 15,
      },
      disabledBtn: {
        backgroundColor: theme.border,
        opacity: 0.7,
      },
      emptyContainer: {
        padding: 40,
        alignItems: "center",
      },
      emptyText: {
        fontSize: 16,
        color: theme.primary,
      },
      row: {
        flexDirection: "row",
        gap: 10,
      },
    });
  }, [theme]);
};

const ProductPriceUpdateScreen = () => {
  const { theme } = useTheme();

  const { token } = useContext(AuthContext);
  const [selectProductId, setSelectProductId] = useState(null);
  const [showPicker, setShowPicker] = useState({ visible: false, field: null });
  const [specificDate, setSpecificDate] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [priceMap, setPriceMap] = useState({});
  const [sellingPrice, setSellingPrice] = useState({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    specific: false,
    dateRange: false,
    updatePrice: false,
  });

  const styles = useStyle(theme);

  const openDatePicker = useCallback((field) => {
    setShowPicker({ visible: true, field });
  }, []);

  // useEffect(() => {
  //   const allPurchase = async () => {
  //     try {
  //       const response = await AllPurchaseDetailsData(token);
  //       setFilteredData(response);
  //     } catch (err) {
  //       toast.error("All data fetching error");
  //       // console.error(err);
  //     }
  //   };
  //   allPurchase();
  // }, [token]);

  useEffect(() => {
    if (filteredData.length > 0) {
      const initialPriceMap = {};
      const intialSellingPrice = {};

      filteredData.forEach((item) => {
        const slotKey = Object.keys(item).find(
          (key) => key !== "delivery_date",
        );
        const products = item[slotKey] || [];

        products.forEach((product) => {
          initialPriceMap[product.id] =
            product.purchase_price?.toString() || "";
          intialSellingPrice[product.id] =
            product.selling_price?.toString() || "";
        });
      });

      setPriceMap(initialPriceMap);
      setSellingPrice(intialSellingPrice);
    }
  }, [filteredData]);

  const handlePriceChange = useCallback((productId, newPrice, value) => {
    if (value === "purchase") {
      setPriceMap((prev) => ({ ...prev, [productId]: newPrice }));
    } else {
      setSellingPrice((prev) => ({ ...prev, [productId]: newPrice }));
    }
  }, []);

  const formatDate = useCallback((date) => {
    return date?.toLocaleDateString("en-CA");
  }, []);

  const onChangeDate = useCallback(
    (event, selectedDate) => {
      if (event.type === "dismissed") {
        setShowPicker({ visible: false, field: null });
        return;
      }

      const currentDate = selectedDate || new Date();
      const updates = {};

      switch (showPicker.field) {
        case "specific":
          updates.specificDate = currentDate;
          updates.startDate = null;
          updates.endDate = null;
          break;
        case "start":
          updates.startDate = currentDate;
          updates.specificDate = null;
          break;
        case "end":
          updates.endDate = currentDate;
          updates.specificDate = null;
          break;
      }

      setShowPicker({ visible: false, field: null });
      setSpecificDate(
        updates.specificDate !== undefined
          ? updates.specificDate
          : specificDate,
      );
      setStartDate(
        updates.startDate !== undefined ? updates.startDate : startDate,
      );
      setEndDate(updates.endDate !== undefined ? updates.endDate : endDate);
    },
    [showPicker.field, specificDate, startDate, endDate],
  );

  const updatePrice = useCallback(
    async (productId) => {
      if (!priceMap[productId]) {
        toast.warning("Please enter a valid price");
        return;
      }

      setSelectProductId(productId);
      setLoadingStates((prev) => ({ ...prev, updatePrice: true }));

      try {
        await UpdatePurchasePrice(
          productId,
          parseFloat(priceMap[productId]),
          parseFloat(sellingPrice[productId]),
        );

        setFilteredData((prevData) =>
          prevData.map((item) => {
            const slotKey = Object.keys(item).find(
              (key) => key !== "delivery_date",
            );
            if (!item[slotKey].some((product) => product.id === productId)) {
              return item;
            }

            return {
              ...item,
              [slotKey]: item[slotKey].map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      purchase_price: parseFloat(priceMap[productId]),
                      selling_price: parseFloat(sellingPrice[productId]),
                    }
                  : product,
              ),
            };
          }),
        );

        toast.success("Price updated successfully");
      } catch (err) {
        toast.error("Failed to update price");
        // console.error(err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, updatePrice: false }));
        setSelectProductId(null);
      }
    },
    [priceMap, sellingPrice],
  );

  const applyDateFilter = useCallback(async () => {
    if (startDate && endDate) {
      setLoadingStates((prev) => ({ ...prev, dateRange: true }));
      try {
        const dateStringStart = formatDate(startDate);
        const dateStringEnd = formatDate(endDate);
        const response = await SpcificDateRangeData(
          dateStringStart,
          dateStringEnd,
          token,
        );
        setFilteredData(response);
      } catch (err) {
        if (err.response?.status === 400) {
          toast.error("No data found for the selected date");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, dateRange: false }));
      }
    } else if (specificDate) {
      setLoadingStates((prev) => ({ ...prev, specific: true }));
      try {
        const dateString = formatDate(specificDate);
        const response = await SpecificDateData(dateString, token);
        setFilteredData(response);
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("No data found for the selected date");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, specific: false }));
      }
    } else {
      toast.warning("Please select a specific date or a full date range");
    }
  }, [startDate, endDate, specificDate, formatDate, token]);

  const handlePdfActions = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      if (!specificDate) {
        toast.warning("Please select a specific date");
        return;
      }

      const dateString = formatDate(specificDate);
      const response = await GenerateSpcificDatePdf(dateString, token);

      // Convert ArrayBuffer to Base64 safely
      const buffer = new Uint8Array(response.data);
      let binary = "";
      for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
      }
      const base64 = RNFetchBlob.base64.encode(binary);

      const filePath = `${
        RNFetchBlob.fs.dirs.DownloadDir
      }/purchase_history_${Date.now()}.pdf`;

      await RNFetchBlob.fs.writeFile(filePath, base64, "base64");

      if (Platform.OS === "android") {
        await RNFetchBlob.android.actionViewIntent(filePath, "application/pdf");
      } else {
        RNFetchBlob.ios.previewDocument(filePath);
      }
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("PDF error:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [specificDate, token, formatDate]);
  const renderProductItem = useCallback(
    ({ product }) => {
      const isUpdating =
        selectProductId === product.id && loadingStates.updatePrice;

      return (
        <View key={product.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{product.product_name}</Text>
            <Text style={styles.subText}>Location: {product.location}</Text>
            <Text style={styles.subText}>Variant: {product.variant}</Text>
            <Text style={styles.subText}>Qty: {product.quantity}</Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text style={styles.label}>Purchase Price</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.dollar}>₹</Text>
                  <TextInput
                    style={styles.input}
                    value={priceMap[product.id] || ""}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      handlePriceChange(product.id, text, "purchase")
                    }
                  />
                </View>
              </View>
              <View>
                <Text style={styles.label}>Selling Price</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.dollar}>₹</Text>
                  <TextInput
                    style={styles.input}
                    value={sellingPrice[product.id] || ""}
                    keyboardType="numeric"
                    onChangeText={(text) => handlePriceChange(product.id, text)}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: isUpdating ? "gray" : theme.primary,
                borderWidth: 1, // Sets the border thickness
                borderColor: theme.border, // Sets the border color (or use 'gray'/'#ccc')
                borderRadius: 8,
                padding: 10,
                marginTop: 6,
              }}
              onPress={() => updatePrice(product.id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.WHITE} />
              ) : (
                <Text style={{ color: "white", textAlign: "center" }}>
                  Update
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [
      handlePriceChange,
      loadingStates.updatePrice,
      priceMap,
      sellingPrice,
      selectProductId,
      updatePrice,
    ],
  );

  const renderDateSection = useCallback(
    (item) => {
      const deliveryDate = item?.delivery_date;
      const slotKey = Object.keys(item).find((key) => key !== "delivery_date");
      const products = item[slotKey] || [];

      return (
        <View key={deliveryDate} style={styles.dateSection}>
          <Text style={styles.dateHeader}>{deliveryDate}</Text>
          <Text style={styles.slotHeader}>{slotKey || "No Slot"}</Text>
          {products.map((product) => renderProductItem({ product }))}
        </View>
      );
    },
    [renderProductItem],
  );

  const datePickerValue = useMemo(() => {
    return showPicker.field === "specific"
      ? specificDate || new Date()
      : showPicker.field === "start"
        ? startDate || new Date()
        : endDate || new Date();
  }, [showPicker.field, specificDate, startDate, endDate]);

  return (
    <SafeAreaView style={{ flex: 1, marginHorizontal: 10 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 70 }}
      >
        <Text style={styles.header}>Select Specific Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => openDatePicker("specific")}
        >
          <Text style={styles.datePickerStyle}>
            {specificDate ? formatDate(specificDate) : "Tap to select a date"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.header}>Select Date Range</Text>
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}
        >
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => openDatePicker("start")}
          >
            <Text style={styles.datePickerStyle}>
              {startDate ? formatDate(startDate) : "Tap to start date"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => openDatePicker("end")}
          >
            <Text style={styles.datePickerStyle}>
              {endDate ? formatDate(endDate) : "Tap to end date"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={applyDateFilter}
          disabled={loadingStates.specific || loadingStates.dateRange}
        >
          {loadingStates.specific || loadingStates.dateRange ? (
            <ActivityIndicator color={theme.heading} />
          ) : (
            <Text style={{ color: "white" }}>Apply Filters</Text>
          )}
        </TouchableOpacity>

        {showPicker.visible && (
          <DateTimePicker
            value={datePickerValue}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={
              showPicker.field === "end" && startDate ? startDate : undefined
            }
            maximumDate={
              showPicker.field === "start" && endDate ? endDate : undefined
            }
          />
        )}

        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        ) : (
          filteredData.map(renderDateSection)
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.downloadBtn, isGeneratingPdf && styles.disabledBtn]}
        disabled={isGeneratingPdf}
        onPress={handlePdfActions}
      >
        {isGeneratingPdf ? (
          <ActivityIndicator color={theme.textSecondary} />
        ) : (
          <Text style={{ color: "white" }}>Download PDF</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};
export default ProductPriceUpdateScreen;
