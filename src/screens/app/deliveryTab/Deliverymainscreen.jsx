import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={[styles.dateText, { color: theme.heading }]}>
            {selectedDate.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          onChange={(e, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

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
        {activeTab === "orders" && <OrdersTab date={selectedDate} />}
        {activeTab === "riders" && <RidersTab date={selectedDate} />}
        {activeTab === "cod" && <CODTab date={selectedDate} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingBottom: 16,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
  },
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
