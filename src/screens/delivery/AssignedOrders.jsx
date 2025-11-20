import { Search, MapPin, Navigation, Clock } from "lucide-react-native";
import { TextInput, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const MOCK_ORDERS = [
  {
    id: 1,
    customerName: "Rajesh Kumar",
    address: "H.No 234, Sector 21, Dwarka",
    distance: "2.3 km",
    items: 5,
    value: "₹847",
    time: "10:30 AM",
    status: "pending",
  },
  {
    id: 2,
    customerName: "Priya Sharma",
    address: "Flat 45, Green Valley Apartments",
    distance: "1.8 km",
    items: 3,
    value: "₹524",
    time: "11:00 AM",
    status: "pending",
  },
  {
    id: 3,
    customerName: "Amit Patel",
    address: "B-12, Model Town, Phase 2",
    distance: "3.5 km",
    items: 7,
    value: "₹1,234",
    time: "11:30 AM",
    status: "pending",
  },
  {
    id: 4,
    customerName: "Sneha Verma",
    address: "House 67, Vasant Kunj",
    distance: "4.2 km",
    items: 4,
    value: "₹678",
    time: "12:00 PM",
    status: "pending",
  },
];

export default function AssignedOrders({ onViewOrder }) {
  return (
    <ScrollView className="bg-white">
      <SafeAreaView>
        <View className="p-5 gap-y-4">
          <View>
            <Text className="text-2xl font-bold text-[#1A1A1A] mb-1">
              Assigned Orders
            </Text>
            <Text className="text-base text-[#6F6F6F]">
              8 deliveries pending
            </Text>
          </View>

          <View className="bg-white rounded-lg p-3 flex-row items-center gap-x-3 border border-[#DCE5E1]">
            <Search size={20} className="text-muted-foreground" />
            <TextInput
              // ref={inputRef}
              placeholder="Search products..."
              // value={searchQuery}
              // onChangeText={onSearchChange}
              className="p-0 flex-1 text-base"
              placeholderTextColor="#6b7280"
            />
          </View>

          <View className="gap-y-3 pb-4">
            {MOCK_ORDERS.map((order) => (
              <View
                key={order.id}
                className="bg-white border-2 border-[#DCE5E1] rounded-[16px] p-4 gap-y-3"
              >
                <View className="flex flex-row items-start gap-3">
                  <View className="w-12 h-12 rounded-full bg-[#F6F8F7] flex items-center justify-center border border-[#DCE5E1]">
                    <Text className="text-[#1FAF68]">
                      {order.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex flex-row items-center justify-between mb-1">
                      <Text className="text-lg font-bold text-[#1A1A1A]">
                        {order.customerName}
                      </Text>
                      <Badge className="bg-[#F6F8F7] text-[#1FAF68] hover:bg-[#F6F8F7]">
                        {order.items} items
                      </Badge>
                    </View>

                    <View className="flex flex-row items-start gap-2 text-[#6F6F6F]">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <Text className="text-sm">{order.address}</Text>
                    </View>
                  </View>
                </View>

                <View className="flex flex-row items-center justify-between text-sm">
                  <View className="flex flex-row items-center gap-2 text-[#6F6F6F]">
                    <Navigation size={14} className="text-[#1FAF68]" />
                    <Text>{order.distance}</Text>
                  </View>

                  <View className="flex flex-row items-center gap-2 text-[#6F6F6F]">
                    <Clock size={14} className="text-[#1FAF68]" />
                    <Text>{order.time}</Text>
                  </View>
                  <View>
                    <Text className="font-bold text-[#1FAF68]">
                      {order.value}
                    </Text>
                  </View>
                </View>

                <Button
                  onPress={() => onViewOrder(order)}
                  className="w-full h-10 rounded-[14px] bg-[#1FAF68] hover:bg-[#11834B] text-white"
                >
                  Start Delivery
                </Button>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
