import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@apollo/client/react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { useTheme } from "../../../constant/ThemeContext";
import ErrorMessage from "../../../components/custom/errorMessage";
import MessageBubble from "./components/MessageBubble";
import ChatComposer from "./components/ChatComposer";
import CustomerContextModal from "./components/CustomerContextModal";
import { useChatPollInterval } from "../../../hook/useChatPollInterval";
import {
  GET_WHATSAPP_CONVERSATION_DETAIL,
  GET_WHATSAPP_MESSAGES,
  GET_WHATSAPP_CANNED_RESPONSES,
  GET_WHATSAPP_TEMPLATES,
  SEND_WHATSAPP_MESSAGE,
  SEND_WHATSAPP_TEMPLATE_MESSAGE,
  UPDATE_WHATSAPP_CONVERSATION,
  ADD_WHATSAPP_INTERNAL_NOTE,
} from "../../../graphql/WhatsAppChat";
import {
  CHAT_COLORS,
  CHAT_PAGE_SIZE,
  CHAT_POLL_INTERVAL,
  CHAT_STATUS_OPTIONS,
} from "../../../utils/whatsappChat";
import { setActiveConversation } from "../../../services/activeChatTracker";

const DEFAULT_TEMPLATE_LANGUAGE = "en";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: theme.background },
        center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
        banner: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        windowPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
        windowText: { fontSize: 11, fontWeight: "600" },
        statusRow: {
          flexDirection: "row",
          paddingHorizontal: 8,
          paddingVertical: 8,
          gap: 6,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        statusChip: {
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
        },
        statusChipText: { fontSize: 12, fontWeight: "600" },
        listContent: { paddingVertical: 8 },
        emptyText: { color: theme.secondary, fontSize: 14, textAlign: "center" },
        retryBtn: {
          marginTop: 12,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor: theme.textSecondary,
        },
        retryText: { color: theme.background, fontWeight: "700" },
      }),
    [theme],
  );

const WhatsAppChatThreadScreen = ({ navigation, route }) => {
  const { conversationId, title } = route.params ?? {};
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const listRef = useRef(null);
  const [contextVisible, setContextVisible] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const messagePollInterval = useChatPollInterval(CHAT_POLL_INTERVAL.MESSAGES);

  // Track active conversation so notifications aren't triggered for the current open chat
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
    return () => {
      setActiveConversation(null);
    };
  }, [conversationId]);

  // ── Queries ───────────────────────────────────────────────────────────────
  const {
    data: detailData,
    error: detailError,
    loading: detailLoading,
    refetch: refetchDetail,
  } = useQuery(GET_WHATSAPP_CONVERSATION_DETAIL, {
    variables: { id: conversationId },
    skip: !conversationId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery(GET_WHATSAPP_MESSAGES, {
    variables: { conversationId, first: CHAT_PAGE_SIZE.MESSAGES },
    skip: !conversationId,
    pollInterval: messagePollInterval,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const { data: cannedData, error: cannedError } = useQuery(GET_WHATSAPP_CANNED_RESPONSES, {
    errorPolicy: "all",
  });
  const { data: templatesData, error: templatesError } = useQuery(GET_WHATSAPP_TEMPLATES, {
    errorPolicy: "all",
  });

  const conversation = detailData?.whatsAppConversation;

  console.log('messagesData', messagesData);
  // ASSUMPTION: the API returns messages oldest → newest (the Dashboard scrolls to the bottom).
  // If your backend returns newest-first, reverse this array.
  const messages = messagesData?.whatsAppMessages ?? [];
  const cannedResponses = useMemo(
    () => (cannedData?.whatsAppCannedResponses ?? []).filter((c) => c.isActive !== false),
    [cannedData],
  );

  const templates = useMemo(
  () =>
    (templatesData?.whatsappTemplates ?? []).filter(
      (t) => !t.status || t.status === "APPROVED",
    ),
  [templatesData],
);



  // ── Mutations ─────────────────────────────────────────────────────────────
  const [sendMessageMutation, { loading: sendingMessage }] = useMutation(SEND_WHATSAPP_MESSAGE);
  const [sendTemplateMutation, { loading: sendingTemplate }] = useMutation(
    SEND_WHATSAPP_TEMPLATE_MESSAGE,
  );
  const [updateConversationMutation] = useMutation(UPDATE_WHATSAPP_CONVERSATION);
  const [addNoteMutation] = useMutation(ADD_WHATSAPP_INTERNAL_NOTE);

  const sending = sendingMessage || sendingTemplate;

  useEffect(() => {
  [
    ["detail", detailError],
    ["messages", messagesError],
    ["canned", cannedError],
    ["templates", templatesError],
  ].forEach(([name, err]) => {
   if (err) {
  console.log(
    `[WA ${name}]`,
    err.name,
    err.statusCode,
    err.bodyText?.slice(0, 800) ?? JSON.stringify(err.errors, null, 2),
  );
}
  });
}, [detailError, messagesError, cannedError, templatesError]);


  // ── Header: customer-context button ───────────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      title: title || conversation?.customerName || conversation?.customerPhone || "Chat",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setContextVisible(true)}
          disabled={!conversation}
          style={{ marginRight: 8 }}
          accessibilityLabel="Customer details"
        >
          <Ionicons name="information-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, conversation]);

  // ── Handlers (ported from WhatsAppChatPage) ───────────────────────────────
  const handleSendMessage = useCallback(
    async (text) => {
      try {
        const res = await sendMessageMutation({
          variables: {
            input: { conversationId, content: text, messageType: "TEXT" },
          },
        });
        const errors = res.data?.whatsAppSendMessage?.errors;
        if (errors?.length > 0) {
          toast.error(errors[0].message || "Failed to send message");
          return;
        }
        await refetchMessages();
      } catch (err) {
        toast.error(err?.message || "Failed to dispatch WhatsApp message");
      }
    },
    [conversationId, sendMessageMutation, refetchMessages],
  );

  const handleSendTemplate = useCallback(
    async (templateName, languageCode) => {
      try {
        const res = await sendTemplateMutation({
          variables: {
            input: {
              conversationId,
              templateName,
              // Dashboard hardcodes "en"; prefer the template's own language when known.
              languageCode: languageCode || DEFAULT_TEMPLATE_LANGUAGE,
            },
          },
        });
        const errors = res.data?.whatsAppSendTemplateMessage?.errors;
        if (errors?.length > 0) {
          toast.error(errors[0].message || "Failed to send template");
          return;
        }
        toast.success("Template sent. The 24h window re-opens once the customer replies.");
        await refetchMessages();
      } catch (err) {
        toast.error(err?.message || "Failed to send template message");
      }
    },
    [conversationId, sendTemplateMutation, refetchMessages],
  );

  const handleStatusChange = useCallback(
    async (status) => {
      if (!conversation || status === conversation.status || statusUpdating) return;
      setStatusUpdating(true);
      try {
        const res = await updateConversationMutation({
          variables: { id: conversationId, input: { status } },
        });
        const errors = res.data?.whatsAppConversationUpdate?.errors;
        if (errors?.length > 0) {
          toast.error(errors[0].message || "Failed to update status");
          return;
        }
        await refetchDetail();
        toast.success(`Conversation marked as ${status}`);
      } catch (err) {
        toast.error(err?.message || "Failed to update status");
      } finally {
        setStatusUpdating(false);
      }
    },
    [conversation, conversationId, statusUpdating, updateConversationMutation, refetchDetail],
  );

  // Returns true on success so the modal knows whether to clear its draft.
  const handleAddNote = useCallback(
    async (note) => {
      try {
        const res = await addNoteMutation({
          variables: { conversationId, note },
        });
        const errors = res.data?.whatsAppAddInternalNote?.errors;
        if (errors?.length > 0) {
          toast.error(errors[0].message || "Failed to add note");
          return false;
        }
        await refetchDetail();
        toast.success("Internal note added");
        return true;
      } catch (err) {
        toast.error(err?.message || "Failed to add note");
        return false;
      }
    },
    [conversationId, addNoteMutation, refetchDetail],
  );

  const renderMessage = useCallback(({ item }) => <MessageBubble message={item} />, []);
console.log('conversation-->>', conversation);

  // ── Guard states ──────────────────────────────────────────────────────────
  if (!conversationId) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={styles.emptyText}>No conversation selected.</Text>
      </View>
    );
  }

  if (detailLoading && !conversation) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.textSecondary} />
      </View>
    );
  }

  if (!conversation) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ErrorMessage errorMessage={detailError || { message: "Conversation not found." }} />
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetchDetail()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.banner}>
          <View
            style={[
              styles.windowPill,
              {
                backgroundColor: conversation.isWindowOpen
                  ? CHAT_COLORS.windowOpenBg
                  : CHAT_COLORS.windowClosedBg,
              },
            ]}
          >
            <Text
              style={[
                styles.windowText,
                {
                  color: conversation.isWindowOpen
                    ? CHAT_COLORS.windowOpenText
                    : CHAT_COLORS.windowClosedText,
                },
              ]}
            >
              {conversation.isWindowOpen
                ? "🟢 24h window active"
                : "⚠️ 24h window expired"}
            </Text>
          </View>
          <Text style={{ color: theme.secondary, fontSize: 12 }}>
            {conversation.customerPhone}
          </Text>
        </View>

        <View style={styles.statusRow}>
          {CHAT_STATUS_OPTIONS.map((option) => {
            const active = conversation.status === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                disabled={statusUpdating}
                onPress={() => handleStatusChange(option.value)}
                style={[
                  styles.statusChip,
                  active && {
                    backgroundColor: theme.textSecondary,
                    borderColor: theme.textSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    { color: active ? theme.background : theme.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {messagesLoading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.textSecondary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id || item.metaMessageId}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No messages yet.</Text>
              </View>
            }
          />
        )}

        <ChatComposer
          conversation={conversation}
          cannedResponses={cannedResponses}
          templates={templates}
          sending={sending}
          onSendMessage={handleSendMessage}
          onSendTemplate={handleSendTemplate}
        />
      </KeyboardAvoidingView>

      <CustomerContextModal
        visible={contextVisible}
        conversation={conversation}
        onClose={() => setContextVisible(false)}
        onAddNote={handleAddNote}
      />
    </SafeAreaView>
  );
};

export default WhatsAppChatThreadScreen;
