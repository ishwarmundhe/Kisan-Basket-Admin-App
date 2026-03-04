import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../constant/ThemeContext"; // Adjust path if needed

// Components
import EntriesManagement from "./components/EntriesManagement";
import EntryTypesManagement from "./components/EntryTypesManagement";
import CategoriesManagement from "./components/CategoriesManagement";
import SummaryManagement from "./components/SummaryManagement";

export default function LedgerAdminScreen() {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const [activeTab, setActiveTab] = useState("summary");

  const renderContent = () => {
    switch (activeTab) {
      case "summary":
        return <SummaryManagement setActiveTab={setActiveTab} />;
      case "entries":
        return <EntriesManagement />;
      case "types":
        return <EntryTypesManagement />;
      case "categories":
        return <CategoriesManagement />;
      default:
        return <SummaryManagement />;
    }
  };

  const TabButton = ({ id, label }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === id && styles.activeTab]}
      onPress={() => setActiveTab(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TabButton id="summary" label="Overview" />
        <TabButton id="entries" label="Entries" />
        {/* <TabButton id="types" label="Types" />
        <TabButton id="categories" label="Categories" /> */}
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
}

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background, // Zinc 950
        },

        // --- HEADER / TAB BAR ---
        tabContainer: {
          flexDirection: "row",
          backgroundColor: theme.primary, // Zinc 900
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border, // Zinc 800
        },

        // --- TABS ---
        tab: {
          flex: 1,
          paddingVertical: 10,
          alignItems: "center",
          borderRadius: 8,
          marginHorizontal: 4,
          borderWidth: 1,
          borderColor: "transparent", // Invisible border by default prevents layout jump
        },

        // Inactive Tab Text
        tabText: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.secondary, // Zinc 400 (Muted)
        },

        // Active Tab Style (High Contrast Shadcn Look)
        activeTab: {
          backgroundColor: theme.textSecondary, // White Background
          borderColor: theme.textSecondary,
        },

        // Active Tab Text
        activeTabText: {
          color: theme.background, // Black Text (Inverted)
          fontWeight: "700",
        },

        contentContainer: {
          flex: 1,
          backgroundColor: theme.background,
        },
      }),
    [theme],
  );
