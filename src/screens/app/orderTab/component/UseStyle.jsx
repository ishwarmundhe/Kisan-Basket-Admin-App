import { StyleSheet } from "react-native";

export const useStyle = (theme) =>
  StyleSheet.create({
    safeAreaView: {
      flexGrow: 1,
      backgroundColor: theme.background,
      marginTop: 10,
    },
    container: {
      flexGrow: 1,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      overflow: "hidden",
      marginHorizontal: 10,
      // Zinc 950
    },

    // --- TABLE & LIST ---
    row: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border, // Zinc 800
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: theme.primary, // Zinc 900
    },
    headerRow: {
      backgroundColor: theme.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginBottom: 8,
    },
    cell: {
      flex: 1,
      color: theme.text, // Zinc 50
      fontSize: 14,
    },
    headerCell: {
      color: theme.heading, // White
      fontWeight: "600",
      fontSize: 13,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    numberCell: {
      width: 40,
      textAlign: "center",
      color: theme.secondary,
      fontWeight: "500",
    },
    deleteButton: {
      padding: 8,
    },

    // --- ACTION BUTTONS (Top) ---
    actionButtonContainer: {
      flexDirection: "row",
      paddingTop: 10,
      marginHorizontal: 10,
      gap: 12,
      backgroundColor: theme.background,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.primary, // Zinc 900
      borderWidth: 1,
      borderColor: theme.border, // Zinc 800
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: theme.text, // White
      fontWeight: "600",
      fontSize: 12,
    },
    statusBadge: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: theme.border, // Zinc 800
      alignItems: "center",
      justifyContent: "center",
    },
    statusText: {
      color: theme.text,
      fontWeight: "700",
      textTransform: "uppercase",
    },

    selectionInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.primary, // Zinc 900
      borderWidth: 1,
      borderColor: theme.border, // Zinc 800
      borderRadius: 8,
      paddingHorizontal: 16,
      height: 50,
      marginTop: 10,
      marginBottom: 12,
      marginHorizontal: 16,
    },
    selectionText: {
      flex: 1,
      color: theme.text, // White
      fontSize: 15,
      fontWeight: "500",
    },

    // --- CONFIRM BUTTON (Bottom) ---
    confirmButton: {
      backgroundColor: theme.textSecondary, // White Background
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 30,
      height: 50,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmButtonText: {
      color: theme.background, // Black Text (Inverted)
      fontWeight: "700",
      fontSize: 16,
    },

    // --- MODALS ---
    modalContainer: {
      backgroundColor: theme.primary, // Zinc 900
      margin: 20,
      borderRadius: 12,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.border, // Zinc 800
    },
    slotItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    slotText: {
      color: theme.text,
      fontSize: 16,
      textAlign: "center",
    },
    selectedSlotText: {
      color: theme.deliveryDate, // Green
      fontWeight: "bold",
    },
    modalButtons: {
      flexDirection: "row",
      marginTop: 24,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      backgroundColor: theme.border, // Zinc 800 (Secondary Action)
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },

    // --- EXTRAS ---
    emptyText: {
      color: theme.secondary,
      textAlign: "center",
      marginTop: 60,
      fontSize: 16,
    },
    animationContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.8)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    animation: {
      width: 200,
      height: 200,
    },
    shimmerCard: {
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
    },
  });
