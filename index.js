/**
 * @format
 */
import { AppRegistry } from "react-native";
import {
  getMessaging,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import notifee, { EventType } from "@notifee/react-native";
import App from "./App";
import { name as appName } from "./app.json";
import { navigationRef } from "./src/navigation/navigationRef";

// 1. Firebase background message handler (runs when app is killed or in background)
try {
  const messaging = getMessaging();
  console.log("Registering FCM background message handler...", messaging);
  setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log("🔥 [FCM BACKGROUND MESSAGE]:", remoteMessage);
  });
} catch (error) {
  console.warn("Error registering FCM background handler:", error);
}

// 2. Handle background local notification clicks
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS && detail.notification?.data?.conversationId) {
    const { conversationId, title } = detail.notification.data;
    if (navigationRef.isReady()) {
      navigationRef.navigate("WhatsAppChatThread", { conversationId, title });
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
