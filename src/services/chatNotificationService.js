import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import { navigationRef } from "../navigation/navigationRef";

const CHANNEL_ID = "kisan_live_chat";
const CHANNEL_NAME = "Live Customer Messages";

/**
 * Initializes notification channels and requests permissions
 */
export async function setupChatNotificationChannel() {
  try {
    await notifee.requestPermission();

    await notifee.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
      lights: true,
    });
  } catch (error) {
    console.warn("Failed to setup chat notification channel:", error);
  }
}

/**
 * Displays a push notification for an incoming customer message
 */
export async function showCustomerMessageNotification(conversation) {
  try {
    const customerTitle =
      conversation.customerName ||
      conversation.customerPhone ||
      "Customer";

    const messageText =
      conversation.lastMessage?.content ||
      "Sent a new message";

    await notifee.displayNotification({
      id: String(conversation.id),
      title: `💬 ${customerTitle}`,
      body: messageText,
      data: {
        conversationId: String(conversation.id),
        title: customerTitle,
      },
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [300, 500],
        pressAction: {
          id: "default",
        },
        smallIcon: "ic_launcher",
      },
      ios: {
        sound: "default",
      },
    });
  } catch (error) {
    console.warn("Failed to display chat notification:", error);
  }
}

/**
 * Registers foreground notification press listener
 */
export function registerForegroundNotificationListener() {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification?.data?.conversationId) {
      const { conversationId, title } = detail.notification.data;
      if (navigationRef.isReady()) {
        navigationRef.navigate("WhatsAppChatThread", { conversationId, title });
      }
    }
  });
}
