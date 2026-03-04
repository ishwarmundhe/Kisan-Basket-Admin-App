import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../../constant/ThemeContext";

const useStyle = (theme) => {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 8,
        },
        statsContainer: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: "space-between",
        },
        card: {
          width: "31.5%",
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 8,
        },
        // --- Added: Highlight Selected Card ---
        selectedCard: {
          borderColor: theme.text, // White border for selected
          backgroundColor: "rgba(255,255,255,0.08)", // Slight brightness
          borderWidth: 1.5,
        },
        cardExtra: {
          width: "31.5%",
          padding: 8,
        },
        cardContent: {
          alignItems: "center",
          justifyContent: "center",
        },
        iconContainer: {
          padding: 4,
          borderRadius: 6,
          width: 28,
          height: 28,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 4,
        },
        purpleIcon: { backgroundColor: "rgba(168, 85, 247, 0.15)" },
        blueIcon: { backgroundColor: "rgba(59, 130, 246, 0.15)" },
        greenIcon: { backgroundColor: "rgba(34, 197, 94, 0.15)" },
        orangeIcon: { backgroundColor: "rgba(249, 115, 22, 0.15)" },
        yellowIcon: { backgroundColor: "rgba(234, 179, 8, 0.15)" },
        redIcon: { backgroundColor: "rgba(239, 68, 68, 0.15)" },
        emeraldIcon: { backgroundColor: "rgba(16, 185, 129, 0.15)" },
        label: {
          color: theme.secondary,
          fontSize: 10,
          fontWeight: "500",
          textAlign: "center",
        },
        value: {
          color: theme.heading,
          fontSize: 16,
          fontWeight: "700",
          textAlign: "center",
        },
        legendContainer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 16,
          paddingHorizontal: 4,
          marginTop: 4,
          marginBottom: 8,
        },
        legendItem: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        },
        legendText: {
          fontSize: 14,
          color: theme.secondary,
          fontWeight: "500",
        },
        colorBox: {
          width: 16,
          height: 16,
          borderRadius: 4,
          borderWidth: 1,
        },
      }),
    [theme],
  );
};

const DashboardStats = ({
  vegCount = 0,
  oilCount = 0,
  attaCount = 0,
  todaysOrderCount = 0,
  totalOrdersCount = 0,
  spicesCount = 0,
  pulsesCount = 0,
  onPress,
  activeFilter = "All",
  onFilterSelect,
}) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  // Helper to toggle filter: if clicked again, it resets to "All"
  const handleFilterPress = (filterName) => {
    if (activeFilter === filterName) {
      onFilterSelect("All");
    } else {
      onFilterSelect(filterName);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        {/* ROW 1 */}
        {/* Clicking "Today" clears any active filter */}
        <TouchableOpacity 
          style={[styles.card, activeFilter === "All" && styles.selectedCard]}
          activeOpacity={0.7}
          onPress={() => onFilterSelect("All")}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.purpleIcon]}>
              <Icon name="calendar" size={16} color="#a855f7" />
            </View>
            <Text style={styles.label}>Today (All)</Text>
            <Text style={styles.value}>{todaysOrderCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.blueIcon]}>
              <Icon name="chart-line" size={16} color="#60a5fa" />
            </View>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>{totalOrdersCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, activeFilter === "Vegetable" && styles.selectedCard]}
          activeOpacity={0.7}
          onPress={() => handleFilterPress("Vegetable")}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.greenIcon]}>
              <Icon name="leaf" size={16} color="#4ade80" />
            </View>
            <Text style={styles.label}>Vegetable</Text>
            <Text style={styles.value}>{vegCount}</Text>
          </View>
        </TouchableOpacity>

        {/* ROW 2 */}
        <TouchableOpacity 
          style={[styles.card, activeFilter === "Atta" && styles.selectedCard]}
          activeOpacity={0.7}
          onPress={() => handleFilterPress("Atta")}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.orangeIcon]}>
              <Icon name="barley" size={16} color="#f97316" />
            </View>
            <Text style={styles.label}>Atta</Text>
            <Text style={styles.value}>{attaCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, activeFilter === "Oil" && styles.selectedCard]}
          activeOpacity={0.7}
          onPress={() => handleFilterPress("Oil")}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.yellowIcon]}>
              <Icon name="water" size={16} color="#eab308" />
            </View>
            <Text style={styles.label}>Oil</Text>
            <Text style={styles.value}>{oilCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, activeFilter === "Spices" && styles.selectedCard]}
          activeOpacity={0.7}
          onPress={() => handleFilterPress("Spices")}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.redIcon]}>
              <Icon name="tree" size={16} color="#eab308" />
            </View>
            <Text style={styles.label}>Spices</Text>
            <Text style={styles.value}>{spicesCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, activeFilter === "Pulses" && styles.selectedCard]}
          activeOpacity={0.7}
          onPress={() => handleFilterPress("Pulses")}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.emeraldIcon]}>
              <Icon name="seed" size={16} color="#eab308" />
            </View>
            <Text style={styles.label}>Pulses</Text>
            <Text style={styles.value}>{pulsesCount}</Text>
          </View>
        </TouchableOpacity>

       

        <View style={styles.cardExtra}>
          {/* Atta Legend */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.colorBox,
                {
                  backgroundColor: "rgba(249, 115, 22, 0.15)",
                  borderColor: "#f97316",
                },
              ]}
            />
            <Text style={styles.legendText}>Atta</Text>
          </View>

          {/* Oil Legend */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.colorBox,
                {
                  backgroundColor: "rgba(234, 179, 8, 0.15)",
                  borderColor: "#eab308",
                },
              ]}
            />
            <Text style={styles.legendText}>Oil</Text>
          </View>

          {/* Vegetable Legend */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.colorBox,
                {
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderColor: theme.border,
                },
              ]}
            />
            <Text style={styles.legendText}>Veg/Other</Text>
          </View>
        </View>

        <View style={styles.cardExtra}>
          {/* Spices Legend */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "#ef4444" },
              ]}
            />
            <Text style={styles.legendText}>Spices</Text>
          </View>

          {/* Pulses Legend */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.colorBox,
                { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "#10b981" },
              ]}
            />
            <Text style={styles.legendText}>Pulses</Text>
          </View>
        </View>
        
        <View
          style={[
            styles.card,
            { borderColor: "transparent", backgroundColor: "transparent" },
          ]}
        />
      </View>
    </View>
  );
};

export default DashboardStats;