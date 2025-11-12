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
  { key: "sno", label: "S/No", width: 40, numeric: false },
  { key: "product", label: "Product", width: 120, numeric: false },
  { key: "variant", label: "Variant", width: 80, numeric: false },
  { key: "quantity", label: "Quantity", width: 60, numeric: true },
  { key: "price", label: "Price", width: 50, numeric: true },
  { key: "total", label: "Total", width: 60, numeric: true },
  { key: "delete", label: "Delete", width: 80, numeric: false },
];

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        table: {
          borderRadius: 8,
        },
        header: {
          backgroundColor: theme.primary || "#6200ee",
          justifyContent: "center",
          alignItems: "center",
        },
        headerText: {
          color: "#fff",
          fontWeight: "bold",
        },
        row: {
          backgroundColor: "#f9f9f9",
          justifyContent: "center",
          alignItems: "center",
        },
      }),
    [theme]
  );

const OrderTable = ({ orderLines = [], onDeleteProduct }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  return (
    <ScrollView horizontal>
      <DataTable style={styles.table}>
        {/* Header */}
        <DataTable.Header style={styles.header}>
          {TABLE_COLUMNS.map((col, index) => (
            <DataTable.Title
              key={col.key}
              numeric={col.numeric}
              style={{
                width: col.width,
                justifyContent: col.numeric ? "flex-end" : "flex-start",
                marginRight: index === TABLE_COLUMNS.length - 2 ? 15 : 0, // spacing
              }}
            >
              <Text style={styles.headerText}>{col.label}</Text>
            </DataTable.Title>
          ))}
        </DataTable.Header>

        {/* Rows */}
        {orderLines.map((item, index) => {
          const total = item.amount * item.quantity;
          return (
            <DataTable.Row key={item.id} style={styles.row}>
              <DataTable.Cell style={{ width: TABLE_COLUMNS[0].width }}>
                {index + 1}
              </DataTable.Cell>
              <DataTable.Cell style={{ width: TABLE_COLUMNS[1].width }}>
                {item.productName}
              </DataTable.Cell>
              <DataTable.Cell style={{ width: TABLE_COLUMNS[2].width }}>
                {item.variantName}
              </DataTable.Cell>
              <DataTable.Cell
                numeric
                style={{
                  width: TABLE_COLUMNS[3].width,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {item.quantity}
              </DataTable.Cell>
              <DataTable.Cell numeric style={{ width: TABLE_COLUMNS[4].width }}>
                {item.amount}
              </DataTable.Cell>
              <DataTable.Cell numeric style={{ width: TABLE_COLUMNS[5].width }}>
                {total}
              </DataTable.Cell>
              <DataTable.Cell
                style={{
                  width: TABLE_COLUMNS[6].width,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={() => onDeleteProduct(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#941B00" />
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
