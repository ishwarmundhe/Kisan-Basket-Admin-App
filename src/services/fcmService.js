import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { navigationRef } from "../navigation/navigationRef";

const FCM_CHANNEL_ID = "kisan_fcm_chat";
const FCM_CHANNEL_NAME = "Live Chat Notifications";

/**
 * Pre-creates the notification channel for Android 8+
 */
export async function createFCMChannel() {
  try {
    await notifee.createChannel({
      id: FCM_CHANNEL_ID,
      name: FCM_CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
      lights: true,
    });
    console.log("[FCM] Notification channel registered:", FCM_CHANNEL_ID);
  } catch (err) {
    console.warn("[FCM] Failed to register channel:", err);
  }
}

/**
 * Request notification permissions for both Android (13+) and iOS
 */
export async function requestFCMPermissions() {
  try {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("[FCM] Notification permission denied by user on Android.");
      }
    }

    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log("[FCM] Authorization status:", authStatus, "enabled:", enabled);
    return enabled;
  } catch (error) {
    console.warn("[FCM] Permission request failed:", error);
    return false;
  }
}

/**
 * Retrieves the device FCM token and prints it
 */
export async function getFCMToken() {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging);
    console.log("=================================================");
    console.log("🔥 [FCM TOKEN] Your Device Registration Token:");
    console.log(token);
    console.log("=================================================");
    return token;
  } catch (error) {
    console.warn("[FCM] Failed to get device token:", error);
    return null;
  }
}

/**
 * Displays a heads-up notification when an FCM message arrives in foreground
 */
async function displayForegroundFCMNotification(remoteMessage) {
  try {
    await notifee.createChannel({
      id: FCM_CHANNEL_ID,
      name: FCM_CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
    });

    const title =
      remoteMessage.notification?.title ||
      remoteMessage.data?.title ||
      "New Customer Message";

    const body =
      remoteMessage.notification?.body ||
      remoteMessage.data?.body ||
      "You received a new message";

    const conversationId =
      remoteMessage.data?.conversationId || remoteMessage.data?.threadId;

    await notifee.displayNotification({
      title,
      body,
      data: {
        conversationId: conversationId ? String(conversationId) : undefined,
        title,
      },
      android: {
        channelId: FCM_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [300, 500],
        pressAction: {
          id: "default",
        },
        smallIcon: "ic_launcher",
      },
    });
  } catch (err) {
    console.warn("[FCM] Failed to display foreground notification:", err);
  }
}

/**
 * Navigates to chat thread if notification contains conversationId
 */
function handleNotificationNavigation(remoteMessage) {
  if (!remoteMessage) return;

  const conversationId =
    remoteMessage.data?.conversationId || remoteMessage.data?.threadId;
  const title =
    remoteMessage.data?.title ||
    remoteMessage.notification?.title ||
    "Chat";

  if (conversationId && navigationRef.isReady()) {
    navigationRef.navigate("WhatsAppChatThread", {
      conversationId: String(conversationId),
      title,
    });
  }
}

/**
 * Initializes FCM listeners
 */
export async function initFCM() {
  try {
    // 0. Pre-create notification channel for Android system
    await createFCMChannel();

    const hasPermission = await requestFCMPermissions();
    if (!hasPermission) return;

    const messaging = getMessaging();

    // 1. Get and log the FCM Token
    await getFCMToken();

    // 2. Token refresh listener
    onTokenRefresh(messaging, (newToken) => {
      console.log("🔥 [FCM TOKEN REFRESHED]:", newToken);
    });

    // 3. Handle messages received while the app is in the FOREGROUND
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      console.log("🔥 [FCM FOREGROUND MESSAGE RECEIVED]:", remoteMessage);
      await displayForegroundFCMNotification(remoteMessage);
    });

    // 4. Handle notification tap when app is in BACKGROUND
    const unsubscribeOnOpenedApp = onNotificationOpenedApp(
      messaging,
      (remoteMessage) => {
        console.log("🔥 [FCM OPENED FROM BACKGROUND]:", remoteMessage);
        handleNotificationNavigation(remoteMessage);
      },
    );

    // 5. Handle notification tap when app was COMPLETELY CLOSED / KILLED
    getInitialNotification(messaging)
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("🔥 [FCM OPENED FROM QUIT STATE]:", remoteMessage);
          setTimeout(() => {
            handleNotificationNavigation(remoteMessage);
          }, 800);
        }
      })
      .catch((err) => {
        console.debug("Error checking initial notification:", err);
      });

    return () => {
      unsubscribeOnMessage?.();
      unsubscribeOnOpenedApp?.();
    };
  } catch (error) {
    console.warn("[FCM] Initialization error:", error);
  }
}
