import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useLazyQuery } from "@apollo/client/react";
import { CHANNEL } from "@env";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { DataTable } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../../../constant/ThemeContext";

import { GET_PRODUCT_VARIANTS } from "../../../../graphql/Query";

const TABLE_COLUMNS = [
  { key: "sno", label: "S/No", width: 45, align: "center" },
  { key: "product", label: "Product", width: 140, align: "flex-start" },
  { key: "variant", label: "Variant", width: 80, align: "flex-start" },
  { key: "quantity", label: "Qty", width: 110, align: "center" },
  { key: "price", label: "Price", width: 60, align: "center" },
  { key: "total", label: "Total", width: 60, align: "center" },
  { key: "delete", label: "Delete", width: 60, align: "center" },
];

const VariantPickerModal = ({
  visible,
  onClose,
  productId,
  currentVariantId,
  lineId,
  quantity,
  onChangeVariant,
  isChanging,
  tableConfig,
}) => {
  const { theme } = useTheme();
  const [targetVariantId, setTargetVariantId] = useState(null);

  const [fetchVariants, { data, loading }] = useLazyQuery(
    GET_PRODUCT_VARIANTS,
    { fetchPolicy: "cache-and-network" },
  );

  // Reset target state when modal opens/closes
  useEffect(() => {
    if (!visible) setTargetVariantId(null);
  }, [visible]);

  useEffect(() => {
    if (visible && productId) {
      fetchVariants({ variables: { id: productId, channel: CHANNEL } });
    }
  }, [visible, productId]);

  const variants = data?.product?.variants || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !isChanging && onClose()}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => !isChanging && onClose()}
      >
        <Pressable
          style={[styles.modalSheet, { backgroundColor: theme.primary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.heading }]}>
              Change Variant
            </Text>
            <TouchableOpacity
              onPress={() => !isChanging && onClose()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isChanging}
            >
              <Ionicons name="close" size={22} color={theme.secondary} />
            </TouchableOpacity>
          </View>

          {/* Product name */}
          {data?.product?.name && (
            <Text style={[styles.productNameLabel, { color: theme.secondary }]}>
              {data.product.name}
            </Text>
          )}

          {/* Body */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={theme.textSecondary} />
              <Text style={[styles.loadingText, { color: theme.secondary }]}>
                Loading variants…
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.variantList}
              showsVerticalScrollIndicator={false}
            >
              {variants.map((v) => {
                const isCurrent = v.id === currentVariantId;
                const isTargetLoading = isChanging && v.id === targetVariantId;

                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.variantRow,
                      { borderBottomColor: theme.border },
                      isCurrent && {
                        backgroundColor: `${theme.textSecondary}18`,
                      },
                    ]}
                    onPress={() => {
                      if (!isCurrent) {
                        setTargetVariantId(v.id);
                        onChangeVariant(lineId, v.id, quantity);
                      }
                    }}
                    disabled={isCurrent || isChanging}
                    activeOpacity={isCurrent ? 1 : 0.7}
                  >
                    <View style={styles.variantLeft}>
                      {isTargetLoading ? (
                        <ActivityIndicator
                          size="small"
                          color={theme.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                      ) : (
                        <Ionicons
                          name={
                            isCurrent ? "radio-button-on" : "radio-button-off"
                          }
                          size={18}
                          color={
                            isCurrent ? theme.textSecondary : theme.secondary
                          }
                        />
                      )}
                      <Text
                        style={[
                          styles.variantName,
                          {
                            color: isCurrent ? theme.textSecondary : theme.text,
                            fontWeight: isCurrent ? "700" : "500",
                          },
                        ]}
                      >
                        {v.name}
                      </Text>
                    </View>
                    <Text
                      style={[styles.variantPrice, { color: theme.secondary }]}
                    >
                      ₹{v.pricing?.price?.gross?.amount?.toFixed(2) ?? "—"}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {!loading && variants.length === 0 && (
                <Text style={[styles.emptyText, { color: theme.secondary }]}>
                  No other variants available.
                </Text>
              )}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const OrderTable = ({
  orderLines = [],
  onDeleteProduct,
  onUpdateQuantity,
  onChangeVariant,
  isEditable,
  isChangingVariant,
  tableConfig,
}) => {
  const { theme } = useTheme();

  const [pickerState, setPickerState] = useState({
    visible: false,
    lineId: null,
    productId: null,
    currentVariantId: null,
    quantity: 1,
  });

  const openPicker = useCallback((line) => {
    setPickerState({
      visible: true,
      lineId: line.id,
      productId: line.productId,
      currentVariantId: line.variantId,
      quantity: line.quantity,
    });
  }, []);

  const closePicker = useCallback(() => {
    setPickerState((s) => ({ ...s, visible: false }));
  }, []);

  const prevIsChanging = useRef(isChangingVariant);
  useEffect(() => {
    if (prevIsChanging.current && !isChangingVariant) {
      closePicker();
    }
    prevIsChanging.current = isChangingVariant;
  }, [isChangingVariant, closePicker]);

  const handleChangeVariant = useCallback(
    (lineId, newVariantId, qty) => {
      onChangeVariant?.(lineId, newVariantId, qty);
    },
    [onChangeVariant],
  );

  return (
    <>
      <View
        style={[
          styles.tableWrapper,
          { borderColor: theme.border },
          tableConfig && { maxHeight: 320 },
        ]}
      >
        <ScrollView horizontal contentContainerStyle={styles.horizontalScroll}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <DataTable style={styles.table}>
              <DataTable.Header
                style={[styles.header, { backgroundColor: theme.primary }]}
              >
                {TABLE_COLUMNS.map((col) => (
                  <DataTable.Title
                    key={col.key}
                    style={{ width: col.width, justifyContent: col.align }}
                  >
                    <Text style={styles.headerText}>{col.label}</Text>
                  </DataTable.Title>
                ))}
              </DataTable.Header>

              {orderLines.length === 0 ? (
                <View
                  style={{
                    paddingVertical: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Text style={{ color: theme.secondary, fontSize: 15 }}>
                    Cart is Empty
                  </Text>
                </View>
              ) : (
                orderLines.map((item, index) => {
                  const total = (item.amount * item.quantity).toFixed(2);
                  const isThisRowSwapping =
                    isChangingVariant && pickerState.lineId === item.id;

                  return (
                    <DataTable.Row
                      key={item.id}
                      style={[styles.row, { borderBottomColor: theme.border }]}
                    >
                      {/* S/No */}
                      <DataTable.Cell
                        style={{
                          width: TABLE_COLUMNS[0].width,
                          justifyContent: TABLE_COLUMNS[0].align,
                        }}
                        textStyle={styles.cellText}
                      >
                        {index + 1}
                      </DataTable.Cell>

                      {/* Product */}
                      <DataTable.Cell
                        style={{
                          width: TABLE_COLUMNS[1].width,
                          justifyContent: TABLE_COLUMNS[1].align,
                        }}
                        textStyle={styles.cellText}
                      >
                        {item.productName}
                      </DataTable.Cell>

                      {/* Variant */}
                      <DataTable.Cell
                        style={{
                          width: TABLE_COLUMNS[2].width,
                          justifyContent: TABLE_COLUMNS[2].align,
                        }}
                      >
                        {isEditable ? (
                          <TouchableOpacity
                            style={[
                              styles.variantChip,
                              {
                                borderColor: theme.textSecondary,
                                backgroundColor: `${theme.textSecondary}12`,
                              },
                              isThisRowSwapping && { opacity: 0.5 },
                            ]}
                            onPress={() => openPicker(item)}
                            disabled={isChangingVariant}
                            activeOpacity={0.7}
                          >
                            {isThisRowSwapping ? (
                              <ActivityIndicator
                                size="small"
                                color={theme.textSecondary}
                              />
                            ) : (
                              <>
                                <Text
                                  style={[
                                    styles.variantChipText,
                                    { color: theme.textSecondary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.variantName}
                                </Text>
                                <Ionicons
                                  name="chevron-down"
                                  size={11}
                                  color={theme.textSecondary}
                                  style={{ marginLeft: 3 }}
                                />
                              </>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.cellText}>
                            {item.variantName}
                          </Text>
                        )}
                      </DataTable.Cell>

                      {/* Quantity */}
                      <DataTable.Cell
                        style={{
                          width: TABLE_COLUMNS[3].width,
                          justifyContent: TABLE_COLUMNS[3].align,
                        }}
                      >
                        {isEditable ? (
                          <View style={styles.quantityContainer}>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() =>
                                onUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || isChangingVariant}
                            >
                              <Ionicons
                                name="remove-circle"
                                size={22}
                                color={
                                  item.quantity <= 1 || isChangingVariant
                                    ? "#ccc"
                                    : "#ff6b6b"
                                }
                              />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() =>
                                onUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={isChangingVariant}
                            >
                              <Ionicons
                                name="add-circle"
                                size={22}
                                color={isChangingVariant ? "#ccc" : "#4caf50"}
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <Text style={styles.cellText}>{item.quantity}</Text>
                        )}
                      </DataTable.Cell>

                      {/* Price */}
                      <DataTable.Cell
                        style={{
                          width: TABLE_COLUMNS[4].width,
                          justifyContent: TABLE_COLUMNS[4].align,
                        }}
                        textStyle={styles.cellText}
                      >
                        {item.amount}
                      </DataTable.Cell>

                      {/* Total */}
                      <DataTable.Cell
                        style={{
                          width: TABLE_COLUMNS[5].width,
                          justifyContent: TABLE_COLUMNS[5].align,
                        }}
                        textStyle={styles.cellText}
                      >
                        {total}
                      </DataTable.Cell>

                      {/* Delete */}
                      <DataTable.Cell
                        style={{
                          width: TABLE_COLUMNS[6].width,
                          justifyContent: TABLE_COLUMNS[6].align,
                        }}
                      >
                        <TouchableOpacity
                          disabled={!isEditable || isChangingVariant}
                          onPress={() => onDeleteProduct(item.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={
                              isEditable && !isChangingVariant
                                ? "#ff6b6b"
                                : "#0015"
                            }
                          />
                        </TouchableOpacity>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })
              )}
            </DataTable>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Variant picker modal */}
      <VariantPickerModal
        visible={pickerState.visible}
        onClose={closePicker}
        productId={pickerState.productId}
        currentVariantId={pickerState.currentVariantId}
        lineId={pickerState.lineId}
        quantity={pickerState.quantity}
        onChangeVariant={handleChangeVariant}
        isChanging={isChangingVariant}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tableWrapper: {
    overflow: "hidden",
  },
  horizontalScroll: {
    flexGrow: 1,
  },
  table: {
    minWidth: 555,
  },
  header: {},
  headerText: { color: "#ffff", fontWeight: "bold", fontSize: 13 },
  row: { borderBottomWidth: 1 },
  cellText: { color: "#ffff", fontSize: 13 },

  tableContainer: {
    paddingBottom: 20,
    borderRadius: 10,
  },
  table: { borderRadius: 10, overflow: "hidden", minWidth: 555 },
  header: {},
  headerText: { color: "#ffff", fontWeight: "bold", fontSize: 13 },
  row: { borderBottomWidth: 1 },
  cellText: { color: "#ffff", fontSize: 13 },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  qtyBtn: { padding: 4 },
  qtyText: { color: "#ffff", fontWeight: "600", fontSize: 14 },

  variantChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    maxWidth: 100,
  },
  variantChipText: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalSheet: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    maxHeight: "75%",
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 17, fontWeight: "700" },
  productNameLabel: { fontSize: 13, marginBottom: 14 },

  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  variantList: { marginTop: 4, marginBottom: 12 },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  variantLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  variantName: { fontSize: 15, flexShrink: 1 },
  variantPrice: { fontSize: 14, fontWeight: "600" },
  emptyText: { textAlign: "center", marginVertical: 20, fontSize: 14 },
});

export default OrderTable;
