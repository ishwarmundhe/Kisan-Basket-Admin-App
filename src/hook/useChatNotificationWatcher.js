import { useEffect, useRef } from "react";
import { client } from "../client/client";
import { GET_WHATSAPP_CONVERSATIONS } from "../graphql/WhatsAppChat";
import {
  setupChatNotificationChannel,
  showCustomerMessageNotification,
  registerForegroundNotificationListener,
} from "../services/chatNotificationService";
import { getActiveConversation } from "../services/activeChatTracker";

const CHAT_POLL_INTERVAL_MS = 8000; // Poll every 8 seconds

export function useChatNotificationWatcher(isEnabled = true) {
  const knownMessageIdsRef = useRef(new Set());
  const isInitialFetchRef = useRef(true);

  useEffect(() => {
    if (!isEnabled) return;

    // 1. Setup notification channel and permissions
    setupChatNotificationChannel();

    // 2. Register foreground notification press handler
    const unsubscribeForeground = registerForegroundNotificationListener();

    // 3. Poll conversations to detect incoming customer messages
    const checkNewMessages = async () => {
      try {
        const { data } = await client.query({
          query: GET_WHATSAPP_CONVERSATIONS,
          variables: { first: 30 },
          fetchPolicy: "network-only",
        });

        const conversations = data?.whatsAppConversations || [];

        // On first run, record all existing message IDs so we don't notify for old messages
        if (isInitialFetchRef.current) {
          conversations.forEach((conv) => {
            if (conv?.lastMessage?.id) {
              knownMessageIdsRef.current.add(conv.lastMessage.id);
            }
          });
          isInitialFetchRef.current = false;
          return;
        }

        // Subsequent runs: check for new inbound messages
        for (const conv of conversations) {
          const lastMsg = conv?.lastMessage;
          if (!lastMsg?.id) continue;

          // If message is inbound (from customer) and has not been notified yet
          if (
            lastMsg.direction === "INBOUND" &&
            !knownMessageIdsRef.current.has(lastMsg.id)
          ) {
            knownMessageIdsRef.current.add(lastMsg.id);

            // Don't show notification if the admin is currently inside this chat thread
            const activeId = getActiveConversation();
            if (String(activeId) !== String(conv.id)) {
              await showCustomerMessageNotification(conv);
            }
          } else {
            knownMessageIdsRef.current.add(lastMsg.id);
          }
        }
      } catch (err) {
        // Silently catch network glitches during background polling
        console.debug("Chat notification watcher polling error:", err?.message);
      }
    };

    // Run initial fetch immediately
    checkNewMessages();

    // Interval polling
    const intervalId = setInterval(checkNewMessages, CHAT_POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      unsubscribeForeground();
    };
  }, [isEnabled]);
}
