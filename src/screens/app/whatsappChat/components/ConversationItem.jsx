import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../../../constant/ThemeContext";
import {
  CHAT_COLORS,
  formatTime,
  getStaffName,
} from "../../../../utils/whatsappChat";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        row: {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.background,
        },
        topLine: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        },
        nameWrap: { flexDirection: "row", alignItems: "center", flex: 1, gap: 6 },
        name: { fontSize: 15, fontWeight: "700", color: theme.heading, flexShrink: 1 },
        time: { fontSize: 12, color: theme.secondary },
        bottomLine: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        },
        snippet: { flex: 1, fontSize: 13, color: theme.secondary },
        unreadBadge: {
          minWidth: 22,
          height: 22,
          borderRadius: 11,
          paddingHorizontal: 6,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.success,
        },
        unreadText: { fontSize: 12, fontWeight: "700", color: "#fff" },
        badgeRow: { flexDirection: "row", gap: 6, marginTop: 6 },
        badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
        badgeText: { fontSize: 10, fontWeight: "600" },
      }),
    [theme],
  );

const ConversationItem = ({ conversation, isSelected, onPress }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const snippet = conversation.lastMessage?.content || "No messages yet";
  const isOpen = conversation.status === "OPEN";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(conversation)}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${
        conversation.customerName || conversation.customerPhone
      }`}
      style={[styles.row, isSelected && { backgroundColor: theme.primary }]}
    >
      <View style={styles.topLine}>
        <View style={styles.nameWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.customerName || conversation.customerPhone}
          </Text>
          <Text accessibilityLabel={conversation.isWindowOpen ? "24 hour window active" : "24 hour window expired"}>
            {conversation.isWindowOpen ? "🟢" : "⏱️"}
          </Text>
        </View>
        <Text style={styles.time}>{formatTime(conversation.lastMessageAt)}</Text>
      </View>

      <View style={styles.bottomLine}>
        <Text style={styles.snippet} numberOfLines={1}>
          {conversation.lastMessage?.direction === "OUTBOUND" ? "You: " : ""}
          {snippet}
        </Text>
        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isOpen
                ? CHAT_COLORS.windowOpenBg
                : CHAT_COLORS.badgeNeutralBg,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: isOpen
                  ? CHAT_COLORS.windowOpenText
                  : CHAT_COLORS.badgeNeutralText,
              },
            ]}
          >
            {conversation.status}
          </Text>
        </View>
        {conversation.assignedStaff && (
          <View
            style={[styles.badge, { backgroundColor: CHAT_COLORS.badgeAssignedBg }]}
          >
            <Text
              style={[styles.badgeText, { color: CHAT_COLORS.badgeAssignedText }]}
            >
              {getStaffName(conversation.assignedStaff)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default memo(ConversationItem);
