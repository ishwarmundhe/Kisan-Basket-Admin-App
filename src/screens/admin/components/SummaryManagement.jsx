import React, { useState, useMemo } from "react";
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
  CheckCircle,
  XCircle,
  Clock,
  PackageX,
} from "lucide-react-native";
import { format, addDays, subDays } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../constant/ThemeContext";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        center: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        },
        scrollContent: { padding: 12, paddingBottom: 40 },

        // DATE CONTROLS
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

        // SECTION LABEL
        sectionLabel: {
          fontSize: 11,
          fontWeight: "700",
          color: theme.secondary,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 6,
          marginTop: 12,
        },

        balanceCard: {
          backgroundColor: "#14532d",
          borderRadius: 12,
          paddingVertical: 20,
          paddingHorizontal: 16,
          marginBottom: 4,
          borderWidth: 1,
          borderColor: "#15803d",
          shadowColor: "#22c55e",
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        balanceCardNegative: {
          backgroundColor: "#450a0a",
          borderColor: "#b91c1c",
          shadowColor: "#ef4444",
        },
        balanceLabel: {
          color: "#86efac",
          fontSize: 11,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        },
        balanceLabelNegative: { color: "#fca5a5" },
        balanceAmount: {
          color: "#ffffff",
          fontSize: 26,
          fontWeight: "bold",
          marginVertical: 2,
          letterSpacing: -0.5,
        },
        balanceSub: { color: "#bbf7d0", fontSize: 11, opacity: 0.85 },
        balanceSubNegative: { color: "#fecaca" },

        // TWO-COLUMN GRID
        grid: {
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 4,
        },

        // STAT CARD
        card: {
          flex: 1,
          backgroundColor: theme.primary,
          borderRadius: 12,
          padding: 10,
          borderWidth: 1,
          borderColor: theme.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        },
        cardHeader: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
          gap: 8,
        },
        iconCircle: {
          width: 30,
          height: 30,
          borderRadius: 15,
          justifyContent: "center",
          alignItems: "center",
        },
        cardTitle: {
          fontSize: 11,
          color: theme.secondary,
          fontWeight: "600",
          marginBottom: 2,
        },
        cardAmount: {
          fontSize: 18,
          fontWeight: "700",
          color: theme.text,
        },
        cardCount: {
          fontSize: 11,
          color: theme.secondary,
          fontWeight: "500",
        },
        countBadge: {
          display: "inline",
          fontWeight: "700",
          color: theme.text,
        },

        orderCard: {
          backgroundColor: theme.primary,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 4,
        },
        orderCardRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        orderCardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
        orderCardTitle: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
        },
        orderCardSub: { fontSize: 12, color: theme.secondary, marginTop: 2 },
        orderCardRight: { alignItems: "flex-end" },
        orderCardAmount: {
          fontSize: 18,
          fontWeight: "700",
          color: theme.text,
        },
        orderCardCount: { fontSize: 12, color: theme.secondary, marginTop: 2 },

        // CTA
        detailsBtn: {
          backgroundColor: theme.textSecondary,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          borderRadius: 12,
          marginTop: 20,
        },
        detailsBtnText: {
          color: theme.background,
          fontWeight: "700",
          fontSize: 16,
          marginRight: 8,
        },
      }),
    [theme]
  );

// Mini stat card (used in 2-col grid)
const StatCard = ({ title, amount, countLabel, iconBg, icon, amountColor, theme }) => {
  const styles = useStyle(theme);
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardAmount, amountColor ? { color: amountColor } : {}]}>
          ₹{amount?.toLocaleString("en-IN") ?? "0"}
        </Text>
        {countLabel !== undefined && (
          <Text style={styles.cardCount}>{countLabel} orders</Text>
        )}
      </View>
    </View>
  );
};

// Full-width order row card
const OrderRowCard = ({ title, subtitle, amount, count, iconBg, icon, amountColor, theme }) => {
  const styles = useStyle(theme);
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardRow}>
        <View style={styles.orderCardLeft}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            {icon}
          </View>
          <View>
            <Text style={styles.orderCardTitle}>{title}</Text>
            {subtitle && <Text style={styles.orderCardSub}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.orderCardRight}>
          <Text style={[styles.orderCardAmount, amountColor ? { color: amountColor } : {}]}>
            ₹{amount?.toLocaleString("en-IN") ?? "0"}
          </Text>
          <Text style={styles.orderCardCount}>{count ?? 0} orders</Text>
        </View>
      </View>
    </View>
  );
};

export default function SummaryManagement({ setActiveTab }) {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const apiDate = format(selectedDate, "yyyy-MM-dd");
  const displayDate = format(selectedDate, "dd MMM yyyy");

  const { data, isLoading, isFetching, refetch } =
    useGetDailySummaryQuery(apiDate);

  const handlePrevDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const isProfit = (data?.profit ?? 0) >= 0;

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Date Navigation */}
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
            tintColor={theme.text}
          />
        }
      >
        {/* ── Net Balance ── */}
        <Text style={styles.sectionLabel}>Overview</Text>
        <View
          style={[
            styles.balanceCard,
            !isProfit && styles.balanceCardNegative,
          ]}
        >
          <View>
            <Text
              style={[
                styles.balanceLabel,
                !isProfit && styles.balanceLabelNegative,
              ]}
            >
              {isProfit ? "Net Profit" : "Net Loss"}
            </Text>
            <Text
              style={[
                styles.balanceSub,
                !isProfit && styles.balanceSubNegative,
              ]}
            >
              {displayDate}
            </Text>
          </View>
          <Text style={styles.balanceAmount}>
            {isProfit ? "+" : "-"}₹
            {Math.abs(data?.profit ?? 0).toLocaleString("en-IN")}
          </Text>
        </View>

        {/* ── Sales & Expenses ── */}
        <Text style={styles.sectionLabel}>Financials</Text>
        <View style={styles.grid}>
          <StatCard
            title="Total Sales"
            amount={data?.total_sales}
            countLabel={data?.completed_orders?.count}
            iconBg="rgba(74,222,128,0.12)"
            icon={<TrendingUp size={18} color="#4ade80" />}
            amountColor="#4ade80"
            theme={theme}
          />
          <StatCard
            title="Total Expenses"
            amount={data?.total_expenses}
            iconBg="rgba(239,68,68,0.12)"
            icon={<TrendingDown size={18} color="#ef4444" />}
            amountColor="#ef4444"
            theme={theme}
          />
        </View>

        {/* ── Orders ── */}
        <Text style={styles.sectionLabel}>Orders</Text>

        <OrderRowCard
          title="Completed Orders"
          subtitle="Successfully fulfilled"
          amount={data?.completed_orders?.amount}
          count={data?.completed_orders?.count}
          iconBg="rgba(74,222,128,0.12)"
          icon={<CheckCircle size={18} color="#4ade80" />}
          amountColor="#4ade80"
          theme={theme}
        />

        <OrderRowCard
          title="Pending Payments"
          subtitle="Awaiting collection"
          amount={data?.pending_payments?.amount}
          count={data?.pending_payments?.count}
          iconBg="rgba(251,191,36,0.12)"
          icon={<Clock size={18} color="#fbbf24" />}
          amountColor="#fbbf24"
          theme={theme}
        />

        <OrderRowCard
          title="Canceled Orders"
          subtitle="Voided transactions"
          amount={data?.canceled_orders?.amount}
          count={data?.canceled_orders?.count}
          iconBg="rgba(239,68,68,0.12)"
          icon={<XCircle size={18} color="#ef4444" />}
          amountColor="#ef4444"
          theme={theme}
        />

        <OrderRowCard
          title="Unfulfilled Orders"
          subtitle="Not yet dispatched"
          amount={data?.unfulfilled_orders?.amount}
          count={data?.unfulfilled_orders?.count}
          iconBg="rgba(148,163,184,0.12)"
          icon={<PackageX size={18} color="#94a3b8" />}
          amountColor={theme.secondary}
          theme={theme}
        />

        {/* ── CTA ── */}
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