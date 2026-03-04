import React, { useState, useMemo } from "react"; // Added useMemo
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { useGetDailySummaryQuery } from "../../../services/ledgerApi";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";
import { format, addDays, subDays } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../constant/ThemeContext"; // IMPORT THIS

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background,
        },
        center: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        },
        scrollContent: {
          padding: 20,
          paddingBottom: 40,
        },
        // --- DATE CONTROLS ---
        dateControl: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.primary,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        navBtn: {
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.background,
        },
        dateBadge: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.background,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
        },
        dateText: {
          fontSize: 15,
          fontWeight: "600",
          color: theme.text,
          marginRight: 6,
        },
        // --- BALANCE CARD ---
        balanceCard: {
          backgroundColor: "#14532d",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "#15803d",
          shadowColor: "#22c55e",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        balanceLabel: {
          color: "#86efac",
          fontSize: 14,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        balanceAmount: {
          color: "#ffffff",
          fontSize: 36,
          fontWeight: "bold",
          marginVertical: 10,
          letterSpacing: -0.5,
        },
        balanceSub: {
          color: "#bbf7d0",
          fontSize: 13,
          opacity: 0.9,
        },
        // --- GRID ---
        grid: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
        },
        card: {
          flex: 1,
          backgroundColor: theme.primary,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border,
        },
        iconCircle: {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
          // backgroundColor handled inline in component
        },
        cardLabel: {
          fontSize: 13,
          color: theme.secondary,
          fontWeight: "500",
          marginBottom: 4,
        },
        cardAmount: {
          fontSize: 20,
          fontWeight: "700",
          color: theme.text,
        },
        // --- CTA BUTTON ---
        detailsBtn: {
          backgroundColor: theme.textSecondary,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          borderRadius: 12,
        },
        detailsBtnText: {
          color: theme.background,
          fontWeight: "700",
          fontSize: 16,
          marginRight: 8,
        },
      }),
    [theme],
  );

// Helper Component for Cards
const SummaryCard = ({ title, amount, type, icon, theme }) => {
  const isIncome = type === "income";
  const isExpense = type === "expense";

  // Adjusted colors for Dark Mode visibility
  const color = isIncome ? "#4ade80" : isExpense ? "#ef4444" : theme.text;
  // Backgrounds for icons (Darker/Subtler)
  const bg = isIncome
    ? "rgba(74, 222, 128, 0.1)"
    : isExpense
      ? "rgba(239, 68, 68, 0.1)"
      : theme.background;

  const styles = useStyle(theme); // Re-use styles

  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>{icon}</View>
      <View style={{ marginTop: 12 }}>
        <Text style={styles.cardLabel}>{title}</Text>
        <Text style={[styles.cardAmount, { color: color }]}>
          ₹{amount?.toLocaleString("en-IN") || "0"}
        </Text>
      </View>
    </View>
  );
};

export default function SummaryManagement({ setActiveTab }) {
  // 1. GET THEME FIRST
  const { theme } = useTheme();
  // 2. GENERATE STYLES BEFORE ANY RETURNS
  const styles = useStyle(theme);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const apiDate = format(selectedDate, "yyyy-MM-dd");
  const displayDate = format(selectedDate, "dd MMM yyyy");

  const { data, isLoading, error, refetch, isFetching } =
    useGetDailySummaryQuery(apiDate);

  const handlePrevDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  // 3. NOW SAFE TO RETURN LOADING STATE
  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.dateControl}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.navBtn}>
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateBadge}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Calendar color="#4ade80" size={18} style={{ marginRight: 6 }} />
          <Text style={styles.dateText}>{displayDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextDay} style={styles.navBtn}>
          <ChevronRight color={theme.text} size={24} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date(2030, 11, 31)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={["#2E7D32"]}
            tintColor={theme.text} // iOS spinner color
          />
        }
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{data?.profit?.toLocaleString("en-IN") || 0}
          </Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceSub}>Profit/Loss for {displayDate}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <SummaryCard
              title="Total Sales"
              amount={data?.total_sales}
              type="income"
              icon={<TrendingUp size={20} color="#4ade80" />}
              theme={theme} // Pass theme down
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <SummaryCard
              title="Total Expenses"
              amount={data?.total_expenses}
              type="expense"
              icon={<TrendingDown size={20} color="#ef4444" />}
              theme={theme} // Pass theme down
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => setActiveTab("entries")}
        >
          <Text style={styles.detailsBtnText}>View Full Ledger</Text>
          <ChevronRight size={18} color={theme.background} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
