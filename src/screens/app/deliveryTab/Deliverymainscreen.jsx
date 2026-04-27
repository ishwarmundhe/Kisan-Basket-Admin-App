import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import OrdersTab from "./tabs/Orderstab";
import RidersTab from "./tabs/Riderstab";
import CODTab from "./tabs/Codtab";
import { useTheme } from "../../../constant/ThemeContext";

const TABS = [
  { key: "orders", label: "Orders" },
  { key: "riders", label: "Riders" },
  { key: "cod", label: "COD" },
];

const DeliveryMainScreen = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="light-content" />

      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                active && { borderBottomColor: theme.textSecondary },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={{
                  color: active ? theme.textSecondary : theme.secondary,
                  fontWeight: "600",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "riders" && <RidersTab />}
        {activeTab === "cod" && <CODTab />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
});

export default DeliveryMainScreen;
