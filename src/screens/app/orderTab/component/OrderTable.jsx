import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { DataTable } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../../../constant/ThemeContext";

const TABLE_COLUMNS = [
  { key: "sno", label: "S/No", width: 45, align: "center" },
  { key: "product", label: "Product", width: 140, align: "flex-start" },
  { key: "variant", label: "Variant", width: 80, align: "flex-start" },
  { key: "quantity", label: "Qty", width: 110, align: "center" },
  { key: "price", label: "Price", width: 60, align: "center" },
  { key: "total", label: "Total", width: 60, align: "center" },
  { key: "delete", label: "Delete", width: 60, align: "center" },
];

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        tableContainer: {
          paddingBottom: 20, // Space for shadow/scroll
        },
        table: {
          borderRadius: 8,
          overflow: "hidden",
          minWidth: 555,
        },
        header: {
          backgroundColor: theme.primary || "#6200ee",
        },
        headerText: {
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: 13,
        },
        row: {
          backgroundColor: theme.text,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        cellText: {
          color: "#000000",
          fontSize: 13,
        },
        quantityContainer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          gap: 10,
        },
        qtyBtn: {
          padding: 4,
        },
        qtyText: {
          color: "#000000",
          fontWeight: "600",
          fontSize: 14,
        },
      }),
    [theme],
  );

const OrderTable = ({
  orderLines = [],
  onDeleteProduct,
  onUpdateQuantity,
  isEditable,
}) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  return (
    <ScrollView horizontal contentContainerStyle={styles.tableContainer}>
      <DataTable style={styles.table}>
        <DataTable.Header style={styles.header}>
          {TABLE_COLUMNS.map((col) => (
            <DataTable.Title
              key={col.key}
              // Removed numeric prop, handling alignment manually for 1:1 match
              style={{
                width: col.width,
                justifyContent: col.align,
              }}
            >
              <Text style={styles.headerText}>{col.label}</Text>
            </DataTable.Title>
          ))}
        </DataTable.Header>

        {orderLines.map((item, index) => {
          const total = item.amount * item.quantity;
          return (
            <DataTable.Row key={item.id} style={styles.row}>
              <DataTable.Cell
                style={{
                  width: TABLE_COLUMNS[0].width,
                  justifyContent: TABLE_COLUMNS[0].align,
                }}
                textStyle={styles.cellText}
              >
                {index + 1}
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  width: TABLE_COLUMNS[1].width,
                  justifyContent: TABLE_COLUMNS[1].align,
                }}
                textStyle={styles.cellText}
              >
                {item.productName}
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  width: TABLE_COLUMNS[2].width,
                  justifyContent: TABLE_COLUMNS[2].align,
                }}
                textStyle={styles.cellText}
              >
                {item.variantName}
              </DataTable.Cell>

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
                      disabled={item.quantity <= 1}
                    >
                      <Ionicons
                        name="remove-circle"
                        size={22}
                        color={item.quantity <= 1 ? "#ccc" : "#ff6b6b"}
                      />
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Ionicons name="add-circle" size={22} color="#4caf50" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.cellText}>{item.quantity}</Text>
                )}
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  width: TABLE_COLUMNS[4].width,
                  justifyContent: TABLE_COLUMNS[4].align,
                }}
                textStyle={styles.cellText}
              >
                {item.amount}
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  width: TABLE_COLUMNS[5].width,
                  justifyContent: TABLE_COLUMNS[5].align,
                }}
                textStyle={styles.cellText}
              >
                {total}
              </DataTable.Cell>

              <DataTable.Cell
                style={{
                  width: TABLE_COLUMNS[6].width,
                  justifyContent: TABLE_COLUMNS[6].align,
                }}
              >
                <TouchableOpacity
                  disabled={!isEditable}
                  onPress={() => onDeleteProduct(item.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={isEditable ? "#ff6b6b" : "#0015"}
                  />
                </TouchableOpacity>
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </ScrollView>
  );
};

export default OrderTable;
