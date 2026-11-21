import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../../../constant/ThemeContext";
import {
  CHAT_COLORS,
  formatDate,
  formatMoney,
  getStaffName,
} from "../../../../utils/whatsappChat";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: theme.background },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitle: { fontSize: 18, fontWeight: "700", color: theme.heading },
        section: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
        sectionTitle: { fontSize: 14, fontWeight: "700", color: theme.heading, marginBottom: 8 },
        name: { fontSize: 16, fontWeight: "700", color: theme.heading },
        muted: { fontSize: 13, color: theme.secondary, marginTop: 2 },
        card: {
          padding: 10,
          borderRadius: 8,
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
          marginTop: 8,
        },
        rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        strong: { fontSize: 13, fontWeight: "700", color: theme.text },
        accent: { fontSize: 14, fontWeight: "700", color: theme.deliveryDate },
        badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
        badgeText: { fontSize: 10, fontWeight: "600" },
        noteCard: {
          padding: 10,
          borderRadius: 8,
          backgroundColor: theme.primary,
          borderLeftWidth: 3,
          borderLeftColor: CHAT_COLORS.noteAccent,
          marginBottom: 8,
        },
        noteText: { fontSize: 13, fontStyle: "italic", color: theme.text },
        noteMeta: { fontSize: 10, color: theme.secondary, marginTop: 2 },
        noteInput: {
          minHeight: 70,
          padding: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.text,
          fontSize: 13,
          textAlignVertical: "top",
        },
        noteBtn: {
          alignSelf: "flex-end",
          marginTop: 8,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: theme.textSecondary,
        },
        noteBtnText: { color: theme.background, fontWeight: "700", fontSize: 13 },
        disabled: { opacity: 0.5 },
      }),
    [theme],
  );

const CustomerContextModal = ({ visible, conversation, onClose, onAddNote }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
console.log('conversation', conversation);

  if (!conversation) return null;

  const customer = conversation.customer;
  const address = customer?.defaultShippingAddress;
const ordersAvailable = Array.isArray(conversation.recentOrders);
const orders = conversation.recentOrders ?? [];

console.log('ordersAvailable', ordersAvailable)
//   const orders = conversation.recentOrders ?? [];

  const notes = conversation.notes ?? [];
  const walletBalance = conversation.walletBalance ?? customer?.wallet?.balance;

  const handleSubmitNote = async () => {
    const note = newNote.trim();
    if (!note || submitting) return;
    setSubmitting(true);
    try {
      const ok = await onAddNote(note);
      // Only clear the draft if the note was actually saved.
      if (ok) setNewNote("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Customer Details</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close customer details"
          >
            <Ionicons name="close" size={26} color={theme.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Customer info */}
            <View style={styles.section}>
              <Text style={styles.name}>
                {conversation.customerName || "Guest WhatsApp User"}
              </Text>
              <Text style={styles.muted}>{conversation.customerPhone}</Text>
              {!!customer?.email && <Text style={styles.muted}>{customer.email}</Text>}

              {walletBalance !== undefined && walletBalance !== null && (
                <View style={[styles.card, styles.rowBetween]}>
                  <Text style={styles.strong}>Wallet Balance:</Text>
                  <Text style={styles.accent}>{formatMoney(walletBalance)}</Text>
                </View>
              )}

              {!!address && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.strong}>Delivery Address:</Text>
                  <Text style={styles.muted}>
                    {[address.streetAddress1, address.city, address.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              )}
            </View>

            {/* Recent orders */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Orders ({orders.length})</Text>
              {orders.length === 0 ? (
                <Text style={styles.muted}>No previous orders found for this customer.</Text>
              ) : (
                orders.map((order) => {
                  const fulfilled = order.status === "FULFILLED";
                  return (
                    <View key={order.id} style={styles.card}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.strong}>Order #{order.number}</Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: fulfilled
                                ? CHAT_COLORS.windowOpenBg
                                : CHAT_COLORS.badgeWarnBg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color: fulfilled
                                  ? CHAT_COLORS.windowOpenText
                                  : CHAT_COLORS.badgeWarnText,
                              },
                            ]}
                          >
                            {order.status}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.rowBetween, { marginTop: 4 }]}>
                        <Text style={styles.muted}>{formatDate(order.created)}</Text>
                        <Text style={styles.strong}>
                          {formatMoney(order.totalAmount ?? order.total?.gross?.amount)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Internal notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Internal Notes (Staff Only)</Text>
              {notes.length === 0 ? (
                <Text style={[styles.muted, { marginBottom: 8 }]}>No notes added yet.</Text>
              ) : (
                notes.map((note) => (
                  <View key={note.id} style={styles.noteCard}>
                    <Text style={styles.noteText}>"{note.note}"</Text>
                    <Text style={styles.noteMeta}>
                      — {getStaffName(note.author)}
                      {note.createdAt ? ` (${formatDate(note.createdAt)})` : ""}
                    </Text>
                  </View>
                ))
              )}

              <TextInput
                style={styles.noteInput}
                placeholder="Add a private note…"
                placeholderTextColor={theme.secondary}
                value={newNote}
                onChangeText={setNewNote}
                multiline
              />
              <TouchableOpacity
                style={[styles.noteBtn, (!newNote.trim() || submitting) && styles.disabled]}
                disabled={!newNote.trim() || submitting}
                onPress={handleSubmitNote}
              >
                {submitting ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={styles.noteBtnText}>Add Note</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default CustomerContextModal;
