import { useState } from "react";
import { Calendar, MapPin, CheckCircle, Clock } from "lucide-react-native"; // Changed specific icons to match closely
import { Badge } from "../../components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { Text, View, ScrollView } from "react-native";

const MOCK_HISTORY = [
  {
    id: 101,
    date: "2025-11-13",
    customerName: "Rajesh Kumar",
    address: "Sector 21, Dwarka",
    items: 5,
    value: "₹847",
    time: "10:30 AM",
    status: "completed",
  },
  {
    id: 102,
    date: "2025-11-13",
    customerName: "Priya Sharma",
    address: "Green Valley Apartments",
    items: 3,
    value: "₹524",
    time: "11:45 AM",
    status: "completed",
  },
  {
    id: 103,
    date: "2025-11-12",
    customerName: "Amit Patel",
    address: "Model Town, Phase 2",
    items: 7,
    value: "₹1,234",
    time: "2:15 PM",
    status: "completed",
  },
];

export default function DeliveryHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const filteredHistory = MOCK_HISTORY.filter((delivery) => {
    if (selectedPeriod === "today") {
      return delivery.date === "2025-11-13";
    } else if (selectedPeriod === "yesterday") {
      return delivery.date === "2025-11-12";
    }
    return true;
  });

  const totalEarnings = filteredHistory.reduce((sum, delivery) => {
    return sum + parseInt(delivery.value.replace(/[₹,]/g, ""));
  }, 0);

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-5 gap-y-6">
        {/* Header */}
        <View className="mt-8">
          <Text className="text-[#1A1A1A] text-3xl font-bold mb-1">
            Delivery History
          </Text>
          <Text className="text-[#6F6F6F] text-base">
            Track your completed deliveries
          </Text>
        </View>

        {/* Filter Dropdown */}
        <View>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full bg-white border border-[#E5E7EB] rounded-2xl h-12 px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </View>

        {/* Summary Card */}
        <View className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[24px] p-6">
          <View className="flex-row justify-between">
            {/* Deliveries Column */}
            <View className="flex-1">
              <Text className="text-[#6F6F6F] text-base font-medium mb-2">
                Deliveries
              </Text>
              <Text className="text-[#1A1A1A] text-2xl font-bold">
                {filteredHistory.length}
              </Text>
            </View>

            {/* Earnings Column */}
            <View className="flex-1">
              <Text className="text-[#6F6F6F] text-base font-medium mb-2">
                Total Earnings
              </Text>
              <Text className="text-[#1FAF68] text-2xl font-bold">
                ₹{totalEarnings.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* History List */}
        <View className="gap-y-4 pb-8">
          {filteredHistory.map((delivery) => (
            <View
              key={delivery.id}
              className="bg-white border border-[#E5E7EB] rounded-[20px] p-5 shadow-sm"
              // Note: shadow-sm works on web, for RN elevation is needed or shadow style props
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              {/* Card Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <CheckCircle color="#1FAF68" size={24} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-[#1A1A1A] text-lg font-bold">
                      {delivery.customerName}
                    </Text>
                    <Text className="text-[#6F6F6F] text-sm font-medium">
                      Order #{delivery.id}
                    </Text>
                  </View>
                </View>

                <View className="bg-[#E8F5E9] px-3 py-1.5 rounded-full">
                  <Text className="text-[#1FAF68] text-xs font-bold">
                    Completed
                  </Text>
                </View>
              </View>

              {/* Address */}
              <View className="flex-row items-center gap-2 mb-4 pl-1">
                <MapPin size={16} color="#6F6F6F" />
                <Text className="text-[#6F6F6F] text-sm font-medium">
                  {delivery.address}
                </Text>
              </View>

              {/* Card Footer / Divider */}
              <View className="border-t border-[#E5E7EB] pt-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Calendar size={16} color="#6F6F6F" />
                  <Text className="text-[#6F6F6F] text-sm font-medium">
                    {delivery.time}
                  </Text>
                </View>

                <View className="flex-row items-center gap-4">
                  <Text className="text-[#6F6F6F] text-sm font-medium">
                    {delivery.items} items
                  </Text>
                  <Text className="text-[#1FAF68] text-base font-bold">
                    {delivery.value}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {filteredHistory.length === 0 && (
          <View className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[20px] p-8 items-center justify-center">
            <View className="bg-white rounded-full w-16 h-16 mb-4 flex items-center justify-center border border-[#E5E7EB]">
              <CheckCircle className="text-[#6F6F6F]" size={28} />
            </View>
            <Text className="text-[#1A1A1A] text-lg font-bold mb-2">
              No deliveries found
            </Text>
            <Text className="text-[#6F6F6F] text-center">
              Complete deliveries to see them here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
