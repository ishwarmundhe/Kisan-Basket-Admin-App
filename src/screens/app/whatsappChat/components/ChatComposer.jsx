import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../../constant/ThemeContext";
import {
  CHAT_COLORS,
  applyCannedPlaceholders,
} from "../../../../utils/whatsappChat";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: 10,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.background,
        },
        quickBtn: {
          alignSelf: "flex-start",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 8,
        },
        quickBtnText: { fontSize: 12, fontWeight: "600", color: theme.text },
        inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
        input: {
          flex: 1,
          maxHeight: 120,
          minHeight: 44,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.primary,
          color: theme.text,
          fontSize: 14,
        },
        sendBtn: {
          minWidth: 64,
          height: 44,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 12,
          backgroundColor: theme.textSecondary,
        },
        sendText: { color: theme.background, fontWeight: "700" },
        disabled: { opacity: 0.5 },
        cannedBox: {
          maxHeight: 200,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 10,
          backgroundColor: theme.primary,
          marginBottom: 8,
        },
        cannedHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        cannedHeaderText: { fontSize: 12, fontWeight: "700", color: theme.heading },
        cannedItem: {
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        cannedTitle: { fontSize: 12, fontWeight: "700", color: theme.deliveryDate },
        cannedBody: { fontSize: 12, color: theme.secondary, marginTop: 2 },
        emptyText: { padding: 12, fontSize: 12, color: theme.secondary, textAlign: "center" },
        expiredBox: {
          padding: 12,
          borderRadius: 10,
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
        },
        expiredTitle: { fontSize: 14, fontWeight: "700", color: theme.heading },
        expiredHint: { fontSize: 12, color: theme.secondary, marginTop: 2, marginBottom: 8 },
        templateChip: {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          marginRight: 8,
        },
        templateChipActive: { backgroundColor: CHAT_COLORS.windowOpenBg },
        templateChipText: { fontSize: 12, color: theme.text },
        templateChipTextActive: { color: CHAT_COLORS.windowOpenText, fontWeight: "700" },
        customInput: {
          marginTop: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.text,
          fontSize: 13,
        },
      }),
    [theme],
  );

const ChatComposer = ({
  conversation,
  cannedResponses,
  templates,
  sending,
  onSendMessage,
  onSendTemplate,
}) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [inputText, setInputText] = useState("");
  const [showCanned, setShowCanned] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customTemplate, setCustomTemplate] = useState("");

  const searchFilter = inputText.startsWith("/")
    ? inputText.slice(1).toLowerCase().trim()
    : "";

  const filteredCanned = useMemo(
    () =>
      cannedResponses.filter(
        (item) =>
          !searchFilter ||
          item.shortcut?.toLowerCase().includes(searchFilter) ||
          item.title?.toLowerCase().includes(searchFilter) ||
          item.messageContent?.toLowerCase().includes(searchFilter),
      ),
    [cannedResponses, searchFilter],
  );

  const handleChange = (value) => {
    setInputText(value);
    if (value.startsWith("/")) setShowCanned(true);
    else if (showCanned && !value.includes("/")) setShowCanned(false);
  };

  const handleSelectCanned = (item) => {
    setInputText(applyCannedPlaceholders(item.messageContent, conversation));
    setShowCanned(false);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setInputText("");
    setShowCanned(false);
    await onSendMessage(text);
  };

  // ── 24h window expired → Meta template flow ───────────────────────────────
  if (!conversation.isWindowOpen) {
    const isCustom = selectedTemplate === "__custom__";
    const showCustomInput = templates.length === 0 || isCustom;
    const templateToSend = showCustomInput
      ? customTemplate.trim()
      : selectedTemplate;
    const canSend = Boolean(templateToSend) && !sending;

    return (
      <View style={styles.container}>
        <View style={styles.expiredBox}>
          <Text style={styles.expiredTitle}>🔒 24-Hour Customer Window Expired</Text>
          <Text style={styles.expiredHint}>
            Meta requires an approved template message to re-initiate contact.
          </Text>

          {templates.length > 0 && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[...templates, { name: "__custom__", displayName: "✏️ Other…" }]}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => {
                const active = selectedTemplate === item.name;
                return (
                  <TouchableOpacity
                    style={[styles.templateChip, active && styles.templateChipActive]}
                    onPress={() => setSelectedTemplate(item.name)}
                  >
                    <Text
                      style={[
                        styles.templateChipText,
                        active && styles.templateChipTextActive,
                      ]}
                    >
                      {item.displayName || item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {showCustomInput && (
            <TextInput
              style={styles.customInput}
              placeholder="Meta template name (e.g. kb_order_confirmation_1)"
              placeholderTextColor={theme.secondary}
              value={customTemplate}
              onChangeText={setCustomTemplate}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          <TouchableOpacity
            style={[styles.sendBtn, { marginTop: 10 }, !canSend && styles.disabled]}
            disabled={!canSend}
            onPress={() => {
              const match = templates.find((t) => t.name === templateToSend);
              onSendTemplate(templateToSend, match?.languageCode);
            }}
          >
            {sending ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text style={styles.sendText}>Send Template</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Window open → free-form reply ─────────────────────────────────────────
  return (
    <View style={styles.container}>
      {showCanned && (
        <View style={styles.cannedBox}>
          <View style={styles.cannedHeader}>
            <Text style={styles.cannedHeaderText}>
              ⚡ Quick Replies ({filteredCanned.length})
            </Text>
            <TouchableOpacity onPress={() => setShowCanned(false)}>
              <Text style={styles.cannedHeaderText}>✕ Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredCanned}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {cannedResponses.length === 0
                  ? "No quick replies configured yet."
                  : `No quick replies matching "${searchFilter}".`}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cannedItem}
                onPress={() => handleSelectCanned(item)}
              >
                <Text style={styles.cannedTitle}>
                  {item.shortcut} — {item.title}
                </Text>
                <Text style={styles.cannedBody} numberOfLines={2}>
                  {item.messageContent}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.quickBtn}
        onPress={() => setShowCanned((prev) => !prev)}
      >
        <Text style={styles.quickBtnText}>⚡ Quick Replies (or type "/")</Text>
      </TouchableOpacity>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={theme.secondary}
          value={inputText}
          onChangeText={handleChange}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || sending) && styles.disabled]}
          disabled={!inputText.trim() || sending}
          onPress={handleSend}
          accessibilityLabel="Send message"
        >
          {sending ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={styles.sendText}>Send ➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatComposer;
