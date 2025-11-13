
import { StyleSheet , Dimensions} from "react-native";
import { useMemo } from "react";
export const useStyle = (theme) => {
  return useMemo(() => {
  return  StyleSheet.create(
      {
        container: {
          marginHorizontal: 10,
          // paddingTop: 15,
          flex: 1,
        },
        tableContainer: {
          flexGrow: 1,
        },
        selectionText: {
          flex: 1,
          fontSize: 18,
          color: theme.text,
        },
        selectionInput: {
          flexDirection: "row",
          borderWidth: 1,
          borderRadius: 8,
          alignItems: "center",
          margin: 10,
          padding: 5,
          borderColor: theme.border,
        },
        row: {
          flexDirection: "row",
          backgroundColor: theme.primary,
          borderBottomWidth: 1,
          borderColor: theme.border,
        },
        headerRow: {
          backgroundColor: theme.textSecondary,
        },
        cell: {
          minWidth: 120,
          padding: 10,
          borderRightWidth: 1,
          borderColor: theme.border,
          color: theme.text,
        },
        numberCell: {
          minWidth: 20,
          padding: 10,
          borderRightWidth: 1,
          borderColor: theme.border,
          color: theme.text,
        },
        headerCell: {
          fontWeight: "bold",
          color: theme.heading,
        },
        deleteButton: {
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        },
        confirmButton: {
          backgroundColor: theme.textSecondary,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 10,
          marginHorizontal: 10,
        },
        confirmButtonText: {
          color: theme.heading,
          fontSize: 16,
          fontWeight: "500",
        },
        actionButtonContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        },
        actionButton: {
          borderWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 25,
          borderRadius: 8,
          paddingVertical: 12,
          backgroundColor: theme.textSecondary,
          alignSelf: "flex-end",
        },
        buttonText: {
          textAlign: "center",
          fontSize: 14,
          color: theme.text,
          fontWeight: "700",
        },
        statusBadge: {
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e28743",
          paddingHorizontal: 10,
          paddingVertical: 2,
          borderRadius: 50,
        },
        statusText: {
          color: theme.text,
        },
        emptyText: {
          margin: 10,
          fontStyle: "italic",
          color: theme.text,
        },
        modalContainer: {
          backgroundColor: theme.primary,
          paddingTop: 20,
          borderColor: theme.border,
          borderWidth: 1,
          margin: 20,
          borderRadius: 8,
        },
        slotItem: {
          backgroundColor: "transparent",
          marginTop: 8,
        },
        slotText: {
          textAlign: "center",
          fontSize: 16,
          color: theme.text,
        },
        selectedSlotText: {
          fontWeight: "bold",
        },
        modalButtons: {
          flexDirection: "row",
          gap: 5,
          marginTop: 50,
        },
        modalButton: {
          backgroundColor: theme.textSecondary,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        },
        animationContainer: {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          height: Dimensions.get("screen").height / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.text,
          borderRadius: 10,
          marginHorizontal: 20,
        },
        animation: {
          width: 300,
          height: 300,
          marginBottom: 20,
        },
      },
      [theme]
    );
  });
};