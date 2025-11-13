import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../../constant/ThemeContext";
const useStyle = (theme) => {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 15,
        },
        statsContainer: {
          flexDirection: "row",
          gap: 16,
        },
        card: {
          flex: 1,
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 8,
        },
        cardContent: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        iconContainer: {
          padding: 8,
          borderRadius: 8,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        },
        blueIcon: {
          backgroundColor: "rgba(59, 130, 246, 0.2)",
        },
        greenIcon: {
          backgroundColor: "rgba(34, 197, 94, 0.2)",
        },
        iconText: {
          fontSize: 16,
        },
        textContainer: {
          flex: 1,
        },
        label: {
          color: "#94a3b8",
          fontSize: 14,
        },
        value: {
          color: "#ffffff", // text-white
          fontSize: 24,
          fontWeight: "600",
          marginTop: 4,
        },
      }),
    [theme]
  );
};

const DashboardStats = ({ todayOrdersCount = 20, totalOrdersCount = 454, onPress }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  return (
    <View style={styles.container}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        {/* Today Orders Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.blueIcon]}>
              {/* Replace with your icon component */}
              <Icon name="calendar" size={20} color="#60a5fa" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Today Orders</Text>
              <Text style={styles.value}>{todayOrdersCount}</Text>
            </View>
          </View>
        </View>

        {/* Total Orders Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.greenIcon]}>
              {/* Replace with your icon component */}
              <Icon name="trending-up" size={20} color="#4ade80" />
            </View>
            <TouchableOpacity style={styles.textContainer} onPress={onPress}>
              <Text style={styles.label}>Total Orders</Text>
              <Text style={styles.value}>
                {totalOrdersCount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
export default DashboardStats;
