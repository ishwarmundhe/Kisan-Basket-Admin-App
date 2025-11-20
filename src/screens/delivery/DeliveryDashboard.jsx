import { useState } from "react";
import { View, Text, Switch, TouchableOpacity, ScrollView } from "react-native";
import {
  Package,
  DollarSign,
  MapPin,
  Navigation,
  Clock,
  Layers,
  TrendingUp,
  Star,
} from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";

// Mock data
const NEXT_DELIVERY = {
  id: 1,
  customerName: "Rajesh Kumar",
  address: "H.No 234, Sector 21, Dwarka, New Delhi - 110075",
  distance: "2.3 km",
  items: 5,
  value: "₹847",
  time: "10:30 AM",
};

export default function DeliveryDashboard({ onViewOrder }) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView className="p-5  bg-white ">
        <View className="gap-y-6">
          <View className="flex-row items-center justify-between ">
            <View>
              <Text className="text-2xl font-bold text-[#1A1A1A] mb-1">
                Good Morning!
              </Text>
              <Text className="text-base text-[#6F6F6F]">
                Ready for deliveries?
              </Text>
            </View>
            <View className="flex-row items-center gap-3 bg-[#F6F8F7] border border-[#DCE5E1] rounded-full px-4 py-2">
              <Text
                className={`font-medium ${isOnline ? "text-[#1FAF68]" : "text-[#6F6F6F]"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
              <Switch
                trackColor={{ false: "#DCE5E1", true: "#11834B" }}
                thumbColor={isOnline ? "#1FAF68" : "#f4f3f4"}
                ios_backgroundColor="#DCE5E1"
                onValueChange={setIsOnline}
                value={isOnline}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-3">
            {/* Updated Button call to use 'icon' prop */}
            <Button
              className="flex-1 bg-[#1FAF68] rounded-lg"
              icon={<Layers size={18} color="white" />}
            >
              Batch Orders
            </Button>
            {/* Updated Button call to use 'icon' prop */}
            <Button
              variant="outline"
              className="flex-1  border-[#1FAF68] rounded-lg"
              icon={<TrendingUp size={18} color="#1FAF68" />}
            >
              Earnings
            </Button>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-3">
            {/* Assigned Orders */}
            <View
              className="flex-1 bg-[#F6F8F7] border border-[#DCE5E1] rounded-[16px] p-4"
              style={{ borderRadius: 16 }}
            >
              <View
                style={{ borderRadius: 16 }}
                className="bg-[#1FAF68] rounded-xl p-2 w-10 h-10 flex items-center justify-center mb-3"
              >
                <Package color="white" size={20} />
              </View>
              <Text className="text-sm text-[#6F6F6F] mb-1">Assigned</Text>
              <Text className="text-lg font-bold text-[#1A1A1A]">8 Orders</Text>
            </View>

            {/* Today's Earnings */}
            <View
              style={{ borderRadius: 16 }}
              className="flex-1 bg-[#F6F8F7] border border-[#DCE5E1] rounded-[16px] p-4"
            >
              <View
                style={{ borderRadius: 16 }}
                className="bg-[#11834B] rounded-xl p-2 w-10 h-10 flex items-center justify-center mb-3"
              >
                <DollarSign color="white" size={20} />
              </View>
              <Text className="text-sm text-[#6F6F6F] mb-1">Today</Text>
              <Text className="text-lg font-bold text-[#1FAF68]">₹2,450</Text>
            </View>
          </View>

          <LinearGradient
            style={{ borderRadius: 20 }}
            colors={["#1FAF68", "#11834B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className=" p-5"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-white">
                This Week
              </Text>
              {/* Replaced 'bg-white/20' with a style prop for RGBA */}
              <Badge
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 10,
                }}
              >
                +24%
              </Badge>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                {/* Replaced 'text-white/80' with 'opacity-80' */}
                <Text className="text-white opacity-80 text-sm mb-1">
                  Deliveries
                </Text>
                <Text className="text-white text-lg font-semibold">52</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white opacity-80 text-sm mb-1">
                  Earnings
                </Text>
                <Text className="text-white text-lg font-semibold">
                  ₹12,680
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white opacity-80 text-sm mb-1">
                  Distance
                </Text>
                <Text className="text-white text-lg font-semibold">142 km</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Next Delivery Card */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-[#1A1A1A]">
                Next Delivery
              </Text>
              <Text className="text-sm text-[#6F6F6F]">
                {NEXT_DELIVERY.items} items
              </Text>
              .
            </View>

            <View
              style={{ borderRadius: 16 }}
              className="bg-white border-2 border-[#1FAF68] rounded-[20px] p-5 space-y-4"
            >
              {/* Customer Info */}
              <View className="flex-row items-start gap-3 pb-3">
                <View
                  style={{ borderRadius: 16 }}
                  className="w-12 h-12 rounded-full bg-[#F6F8F7] flex items-center justify-center border border-[#DCE5E1]"
                >
                  <Text className="text-[#1FAF68] font-bold text-lg">RK</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-[#1A1A1A] mb-1">
                    {NEXT_DELIVERY.customerName}
                  </Text>
                  <View className="flex-row items-start gap-2">
                    <MapPin size={16} color="#6F6F6F" className="mt-1" />
                    <Text className="text-[#6F6F6F] flex-1">
                      {NEXT_DELIVERY.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Order Details */}
              <View className="flex-row items-center justify-between py-5 border-t border-b border-[#DCE5E1]">
                <View className="flex-row items-center gap-2">
                  <Navigation size={16} color="#1FAF68" />
                  <Text className="text-[#6F6F6F]">
                    {NEXT_DELIVERY.distance}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Clock size={16} color="#1FAF68" />
                  <Text className="text-[#6F6F6F]">{NEXT_DELIVERY.time}</Text>
                </View>
                <Text className="text-[#1FAF68] font-bold">
                  {NEXT_DELIVERY.value}
                </Text>
              </View>

              {/* Action Button */}
              <Button
                onPress={() => onViewOrder(NEXT_DELIVERY)}
                className="flex-1 w-full bg-[#1FAF68] rounded-lg"
                icon={<Layers size={18} color="white" />}
              >
                Start Delivery
              </Button>
            </View>
          </View>

          {/* Performance Stats (as it was, not in screenshot) */}
          <View
            style={{ borderRadius: 16 }}
            className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] p-5 mb-5"
          >
            <Text className="text-lg font-bold text-[#1A1A1A] mb-4">
              Today's Performance
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-[#6F6F6F]">
                  Completed Deliveries
                </Text>
                <Text className="text-base font-semibold text-[#1A1A1A]">
                  12
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-[#6F6F6F]">Total Distance</Text>
                <Text className="text-base font-semibold text-[#1A1A1A]">
                  34.5 km
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-[#6F6F6F]">Average Rating</Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-base font-semibold text-[#1FAF68]">
                    4.8
                  </Text>
                  <Star size={16} color="#FFC107" fill="#FFC107" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
