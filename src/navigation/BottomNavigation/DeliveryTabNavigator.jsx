import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";

// Import your screens
import DeliveryDashboard from "../../screens/delivery/DeliveryDashboard";
import AssignedOrders from "../../screens/delivery/AssignedOrders";
import DeliveryHistory from "../../screens/delivery/DeliveryHistory";
import DeliveryProfile from "../../screens/delivery/DeliveryProfile";
import CollectedPayments from "../../screens/delivery/CollectedPayments"; // Import the new screen

// Import icons
import { Home, Package, Clock, User, Wallet } from "lucide-react-native"; // Added Wallet icon

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ focused, color, size, name }) => {
  // Simple switch for icons
  switch (name) {
    case "home":
      return <Home color={color} size={size} />;
    case "package":
      return <Package color={color} size={size} />;
    case "clock":
      return <Clock color={color} size={size} />;
    case "wallet": // Added case for wallet
      return <Wallet color={color} size={size} />;
    case "user":
      return <User color={color} size={size} />;
    default:
      return <Home color={color} size={size} />;
  }
};

export default function DeliveryTabNavigator() {
  const navigation = useNavigation();

  const handleViewOrder = (order) => {
    navigation.navigate("OrderDetails", { order });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1FAF68",
        tabBarInactiveTintColor: "#6F6F6F",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#DCE5E1",
          height: 60, // Optional: Added slightly more height for better touch targets
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: -5,
          marginBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon focused={focused} color={color} size={20} name="home" />
          ),
        }}
      >
        {(props) => (
          <DeliveryDashboard {...props} onViewOrder={handleViewOrder} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Orders"
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={20}
              name="package"
            />
          ),
        }}
      >
        {(props) => <AssignedOrders {...props} onViewOrder={handleViewOrder} />}
      </Tab.Screen>

      {/* UPDATED PAYMENTS TAB */}
      <Tab.Screen
        name="Payments"
        component={CollectedPayments}
        options={{
          tabBarLabel: "Payments",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={20}
              name="wallet" // Changed icon to Wallet
            />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={DeliveryHistory}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={20}
              name="clock"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={DeliveryProfile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon focused={focused} color={color} size={20} name="user" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
