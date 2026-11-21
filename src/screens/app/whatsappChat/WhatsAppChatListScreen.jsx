import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@apollo/client/react";
import { debounce } from "lodash";
import { toast } from "sonner-native";

import { useTheme } from "../../../constant/ThemeContext";
import ErrorMessage from "../../../components/custom/errorMessage";
import ConversationItem from "./components/ConversationItem";
import { useChatPollInterval } from "../../../hook/useChatPollInterval";
import {
  GET_WHATSAPP_CONVERSATIONS,
  MARK_WHATSAPP_CONVERSATION_READ,
} from "../../../graphql/WhatsAppChat";
import {
  CHAT_POLL_INTERVAL,
  CHAT_TABS,
  buildConversationVariables,
} from "../../../utils/whatsappChat";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: theme.background },
        searchWrap: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
        search: {
          height: 42,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.primary,
          color: theme.text,
          fontSize: 14,
        },
        tabs: {
          flexDirection: "row",
          paddingHorizontal: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        tab: {
          flex: 1,
          alignItems: "center",
          paddingVertical: 12,
          borderBottomWidth: 2,
          borderBottomColor: "transparent",
        },
        tabText: { fontWeight: "600", fontSize: 13 },
        center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
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

const WhatsAppChatListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const variables = useMemo(
    () => buildConversationVariables(activeTab, searchQuery),
    [activeTab, searchQuery],
  );

  const pollInterval = useChatPollInterval(CHAT_POLL_INTERVAL.CONVERSATIONS);

  const { data, loading, error, refetch, networkStatus } = useQuery(
    GET_WHATSAPP_CONVERSATIONS,
    {
      variables,
      pollInterval,
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
  );

  const [markRead] = useMutation(MARK_WHATSAPP_CONVERSATION_READ);

  const conversations = data?.whatsAppConversations ?? [];
  // networkStatus 4 = refetch; avoids the full-screen loader flashing on polls.
  const isInitialLoading = loading && conversations.length === 0;
  const isRefreshing = networkStatus === 4;

  const debouncedSetSearch = useMemo(
    () => debounce((text) => setSearchQuery(text), 500),
    [],
  );

  const handleSearchChange = (text) => {
    setSearchInput(text);
    debouncedSetSearch(text);
  };

  const handleOpenConversation = useCallback(
    (conversation) => {
      navigation.navigate("WhatsAppChatThread", {
        conversationId: conversation.id,
        title: conversation.customerName || conversation.customerPhone,
      });

      if (conversation.unreadCount > 0) {
        markRead({ variables: { id: conversation.id } })
          .then(() => refetch())
          .catch(() => toast.error("Could not mark conversation as read"));
      }
    },
    [navigation, markRead, refetch],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ConversationItem conversation={item} onPress={handleOpenConversation} />
    ),
    [handleOpenConversation],
  );

  const renderBody = () => {
    if (isInitialLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.textSecondary} />
        </View>
      );
    }

    if (error && conversations.length === 0) {
      return (
        <View style={styles.center}>
          <ErrorMessage errorMessage={error} />
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => refetch()}
            tintColor={theme.textSecondary}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No conversations found</Text>
          </View>
        }
        contentContainerStyle={conversations.length === 0 ? { flexGrow: 1 } : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search phone or name…"
          placeholderTextColor={theme.secondary}
          value={searchInput}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.tabs}>
        {CHAT_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, active && { borderBottomColor: theme.textSecondary }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? theme.textSecondary : theme.secondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {renderBody()}
    </SafeAreaView>
  );
};

export default WhatsAppChatListScreen;
