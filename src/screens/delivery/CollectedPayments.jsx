import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  Banknote,
  CreditCard,
  Clock,
  DollarSign,
  Calendar,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data
const COLLECTED_PAYMENTS = [
  {
    id: "ORD-1045",
    customerName: "Rajesh Kumar",
    amount: 877,
    method: "cash",
    time: "10 mins ago",
    status: "collected",
    date: "2024-11-14",
  },
  {
    id: "ORD-1044",
    customerName: "Priya Sharma",
    amount: 554,
    method: "upi",
    time: "25 mins ago",
    status: "collected",
    date: "2024-11-14",
  },
  {
    id: "ORD-1043",
    customerName: "Amit Patel",
    amount: 1264,
    method: "cash",
    time: "1 hour ago",
    status: "collected",
    date: "2024-11-14",
  },
];

export default function CollectedPayments() {
  const [timeFilter, setTimeFilter] = useState("today");
  const [methodFilter, setMethodFilter] = useState("all");

  // Filter Logic
  const filteredPayments = COLLECTED_PAYMENTS.filter((payment) => {
    const matchesMethod =
      methodFilter === "all" || payment.method === methodFilter;
    return matchesMethod;
  });

  // Stats Logic
  const todayStats = {
    totalCollected: COLLECTED_PAYMENTS.reduce((sum, p) => sum + p.amount, 0),
    cashCollected: COLLECTED_PAYMENTS.filter((p) => p.method === "cash").reduce(
      (sum, p) => sum + p.amount,
      0
    ),
    upiCollected: COLLECTED_PAYMENTS.filter((p) => p.method === "upi").reduce(
      (sum, p) => sum + p.amount,
      0
    ),
    pendingSettlement: COLLECTED_PAYMENTS.filter(
      (p) => p.status === "collected"
    ).reduce((sum, p) => sum + p.amount, 0),
    cashOrders: COLLECTED_PAYMENTS.filter((p) => p.method === "cash").length,
    upiOrders: COLLECTED_PAYMENTS.filter((p) => p.method === "upi").length,
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-5">
          <Text className="text-[#1A1A1A] text-2xl font-bold mb-1">
            Collected Payments
          </Text>
          <Text className="text-[#6F6F6F] text-base">
            Track and manage your collections
          </Text>
        </View>

        {/* Summary Card - Gradient */}
        <LinearGradient
          colors={["#1FAF68", "#11834B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[24px] p-5 mb-5"
          style={{ borderRadius: 10 }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-white/80 text-base mb-1">
                Today's Collection
              </Text>
              <Text className="text-white text-3xl font-bold">
                ₹{todayStats.totalCollected.toLocaleString()}
              </Text>
            </View>
            <View
              className="bg-white/20 rounded-full p-3"
              style={{ borderRadius: 10 }}
            >
              <DollarSign color="white" size={28} />
            </View>
          </View>

          {/* Stats Row (Replacing Grid) */}
          <View className="flex-row gap-3">
            {/* Cash Box */}
            <View
              className="flex-1 bg-white/10 rounded-[16px] p-4"
              style={{ borderRadius: 10 }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <Banknote size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80 text-sm font-medium">Cash</Text>
              </View>
              <Text className="text-white text-lg font-bold mb-0.5">
                ₹{todayStats.cashCollected.toLocaleString()}
              </Text>
              <Text className="text-white/60 text-xs">
                {todayStats.cashOrders} orders
              </Text>
            </View>

            {/* UPI Box */}
            <View
              className="flex-1 bg-white/10 rounded-[16px] p-4"
              style={{ borderRadius: 10 }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <CreditCard size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80 text-sm font-medium">UPI</Text>
              </View>
              <Text className="text-white text-lg font-bold mb-0.5">
                ₹{todayStats.upiCollected.toLocaleString()}
              </Text>
              <Text className="text-white/60 text-xs">
                {todayStats.upiOrders} orders
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Pending Settlement Alert */}
        {todayStats.pendingSettlement > 0 && (
          <View
            className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[20px] p-5 mb-6"
            style={{ borderRadius: 10 }}
          >
            <View className="flex-row items-start gap-3 mb-4">
              <Clock color="#EA580C" size={20} style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-[#7C2D12] text-lg font-bold mb-1">
                  Pending Settlement
                </Text>
                <Text className="text-[#C2410C] text-sm leading-5">
                  ₹{todayStats.pendingSettlement.toLocaleString()} collected but
                  not yet settled
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="w-full h-12 rounded-[14px] bg-[#1FAF68] items-center justify-center"
              style={{ borderRadius: 10 }}
            >
              <Text className="text-white font-semibold text-base">
                Request Settlement
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Time Period Filter */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {["Today", "This Week", "This Month"].map((period) => {
              const key = period.toLowerCase().replace(" ", "");
              const isActive =
                timeFilter === key ||
                (key === "thisweek" && timeFilter === "week") ||
                (key === "thismonth" && timeFilter === "month");

              return (
                <TouchableOpacity
                  key={period}
                  onPress={() => {
                    if (period === "Today") setTimeFilter("today");
                    if (period === "This Week") setTimeFilter("week");
                    if (period === "This Month") setTimeFilter("month");
                  }}
                  style={{ borderRadius: 10 }}
                  className={`px-5 py-2.5 rounded-full border ${
                    isActive
                      ? "bg-[#1FAF68] border-[#1FAF68]"
                      : "bg-white border-[#DCE5E1]"
                  }`}
                >
                  <Text
                    className={`${
                      isActive ? "text-white font-semibold" : "text-[#6F6F6F]"
                    }`}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Payment Method Filter */}
        <View className="flex-row gap-3 mb-6">
          {["All", "Cash", "UPI"].map((method) => {
            const key = method.toLowerCase();
            const isActive = methodFilter === key;
            return (
              <TouchableOpacity
                key={method}
                onPress={() => setMethodFilter(key)}
                style={{ borderRadius: 10 }}
                className={`flex-1 py-3 rounded-xl items-center justify-center border ${
                  isActive
                    ? "bg-[#1FAF68] border-[#1FAF68]"
                    : "bg-white border-[#DCE5E1]"
                }`}
              >
                <Text
                  className={`font-medium ${
                    isActive ? "text-white" : "text-[#6F6F6F]"
                  }`}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment History List */}
        <View>
          <Text className="text-[#1A1A1A] text-lg font-bold mb-4">
            Payment History
          </Text>
          <View className="gap-3">
            {filteredPayments.map((payment) => (
              <View
                key={payment.id}
                style={{ borderRadius: 10 }}
                className="bg-white border border-[#DCE5E1] rounded-[20px] p-4"
              >
                {/* Top Row */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-[#1A1A1A] font-bold text-base">
                        {payment.id}
                      </Text>

                      {/* Custom Badge */}
                      <View
                        style={{ borderRadius: 10 }}
                        className={`flex-row items-center px-2 py-0.5 rounded-full ${
                          payment.status === "settled"
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {payment.status === "settled" ? (
                          <CheckCircle
                            size={10}
                            color="#16A34A"
                            style={{ marginRight: 4 }}
                          />
                        ) : (
                          <Clock
                            size={10}
                            color="#EA580C"
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          className={`text-xs font-medium ${
                            payment.status === "settled"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {payment.status === "settled" ? "Settled" : "Pending"}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[#6F6F6F] text-sm font-medium">
                      {payment.customerName}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-[#1FAF68] text-lg font-bold mb-1">
                      ₹{payment.amount}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      {payment.method === "cash" ? (
                        <Banknote size={14} color="#6F6F6F" />
                      ) : (
                        <CreditCard size={14} color="#6F6F6F" />
                      )}
                      <Text className="text-[#6F6F6F] text-xs font-medium capitalize">
                        {payment.method}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-[#E5E7EB] mb-3" />

                {/* Bottom Row */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#6F6F6F" />
                    <Text className="text-[#6F6F6F] text-xs font-medium">
                      {payment.time}
                    </Text>
                  </View>
                  <TouchableOpacity className="flex-row items-center gap-1">
                    <Text className="text-[#1FAF68] text-sm font-bold">
                      View Details
                    </Text>
                    <ArrowUpRight size={14} color="#1FAF68" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
