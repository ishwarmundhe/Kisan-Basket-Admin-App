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
          overflow: "hidden", // Ensures rounded corners apply correctly
        },
        header: {
          backgroundColor: theme.primary || "#6200ee",
          justifyContent: "center",
          alignItems: "center",
        },
        headerText: {
          color: "#ffffff",
          fontWeight: "bold",
        },
        row: {
          backgroundColor: theme.text, // Dark earthy brown background so white text is readable
          justifyContent: "center",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        cellText: {
          color: "#000000", // Forcing the text color to be white
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
              <DataTable.Cell 
                style={{ width: TABLE_COLUMNS[0].width }}
                textStyle={styles.cellText}
              >
                {index + 1}
              </DataTable.Cell>
              <DataTable.Cell 
                style={{ width: TABLE_COLUMNS[1].width }}
                textStyle={styles.cellText}
              >
                {item.productName}
              </DataTable.Cell>
              <DataTable.Cell 
                style={{ width: TABLE_COLUMNS[2].width }}
                textStyle={styles.cellText}
              >
                {item.variantName}
              </DataTable.Cell>
              <DataTable.Cell
                numeric
                style={{
                  width: TABLE_COLUMNS[3].width,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                textStyle={styles.cellText}
              >
                {item.quantity}
              </DataTable.Cell>
              <DataTable.Cell 
                numeric 
                style={{ width: TABLE_COLUMNS[4].width }}
                textStyle={styles.cellText}
              >
                {item.amount}
              </DataTable.Cell>
              <DataTable.Cell 
                numeric 
                style={{ width: TABLE_COLUMNS[5].width }}
                textStyle={styles.cellText}
              >
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
                  {/* Changed icon color to a slightly brighter red to pop against the dark row */}
                  <Ionicons name="trash-outline" size={20} color="#ff6b6b" /> 
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