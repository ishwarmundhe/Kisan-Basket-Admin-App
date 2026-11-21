import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { toast } from "sonner-native";
import {
  CHAT_COLORS,
  formatTime,
  getDeliveryTick,
  getStaffName,
} from "../../../../utils/whatsappChat";

const styles = StyleSheet.create({
  rowBase: { flexDirection: "row", paddingHorizontal: 12, marginVertical: 3 },
  bubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  meta: { fontSize: 11, color: CHAT_COLORS.bubbleMeta, marginBottom: 2 },
  metaBold: { fontWeight: "700" },
  image: { width: 220, height: 220, borderRadius: 8, marginVertical: 4 },
  attachment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  attachmentText: { flex: 1, fontSize: 13, fontWeight: "700", color: CHAT_COLORS.bubbleText },
  attachmentAction: { fontSize: 12, fontWeight: "700", color: CHAT_COLORS.link },
  body: { fontSize: 14, color: CHAT_COLORS.bubbleText },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  time: { fontSize: 10, color: CHAT_COLORS.bubbleMeta },
  tick: { fontSize: 11 },
});

const MessageBubble = ({ message }) => {
  const isOutbound = message.direction === "OUTBOUND";
  const type = message.messageType?.toLowerCase();
  const hasMedia = Boolean(message.mediaUrl);

  const openUrl = useCallback(async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      toast.error("Could not open the link");
    }
  }, []);

  const bubbleStyle = useMemo(
    () => [
      styles.bubble,
      {
        backgroundColor: isOutbound
          ? CHAT_COLORS.outboundBubble
          : CHAT_COLORS.inboundBubble,
      },
    ],
    [isOutbound],
  );

  // Text/caption is shown for everything except location + audio (same rule as Dashboard).
  const showText = type !== "location" && type !== "audio" && Boolean(message.content);

  return (
    <View
      style={[
        styles.rowBase,
        { justifyContent: isOutbound ? "flex-end" : "flex-start" },
      ]}
    >
      <View style={bubbleStyle}>
        {message.isAutomated && (
          <Text style={[styles.meta, styles.metaBold]}>🤖 Automated Bot</Text>
        )}
        {isOutbound && message.senderStaff && !message.isAutomated && (
          <Text style={styles.meta}>Staff: {getStaffName(message.senderStaff)}</Text>
        )}

        {type === "image" && hasMedia && (
          <TouchableOpacity
            onPress={() => openUrl(message.mediaUrl)}
            accessibilityLabel="Open photo"
          >
            <Image source={{ uri: message.mediaUrl }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        )}

        {/* No audio lib in the Admin app: open the voice note in the system player. */}
        {type === "audio" && hasMedia && (
          <TouchableOpacity
            style={styles.attachment}
            onPress={() => openUrl(message.mediaUrl)}
            accessibilityLabel="Play voice note"
          >
            <Text style={styles.attachmentText}>🎤 Voice note</Text>
            <Text style={styles.attachmentAction}>Play</Text>
          </TouchableOpacity>
        )}

        {type === "document" && (
          <View style={styles.attachment}>
            <Text style={styles.attachmentText} numberOfLines={2}>
              📄 {message.content || "Document"}
            </Text>
            {hasMedia && (
              <TouchableOpacity onPress={() => openUrl(message.mediaUrl)}>
                <Text style={styles.attachmentAction}>Open</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {type === "location" && (
          <View style={styles.attachment}>
            <Text style={styles.attachmentText}>
              {message.content || "📍 Shared Location"}
            </Text>
            {hasMedia && (
              <TouchableOpacity onPress={() => openUrl(message.mediaUrl)}>
                <Text style={styles.attachmentAction}>Maps ↗</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showText && <Text style={styles.body}>{message.content}</Text>}

        <View style={styles.footer}>
          <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
          {isOutbound && (
            <Text
              style={[
                styles.tick,
                {
                  color:
                    message.status === "read"
                      ? CHAT_COLORS.read
                      : CHAT_COLORS.bubbleMeta,
                },
              ]}
            >
              {getDeliveryTick(message.status)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default memo(MessageBubble);
