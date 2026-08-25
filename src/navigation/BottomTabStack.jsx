import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dimensions, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../constant/ThemeContext";

// Screens
import TodayOrderScreen from "../screens/app/orderTab/Order";
import CustomerDetailScreen from "../screens/app/customerTab/CustomerScreen";
import AllOrdersScreen from "../screens/app/orderTab/AllOrdersScreen"; // Replaces ProductListScreen
import PendingPaymentScreen from "../screens/app/orderTab/PendingPaymentScreen";
import LedgerAdminScreen from "../screens/admin/LedgerAdminScreen";
import DeliveryMainScreen from "../screens/app/deliveryTab/Deliverymainscreen";

const Tab = createBottomTabNavigator();
const { height } = Dimensions.get("window");

const BottomTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: theme.primary,
          paddingBottom: 10,
          height: 60,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#C8E6C9",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Customer") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "AllOrders") {
            // Updated icon for All Orders
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "PendingPayment") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Ledger") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Delivery") {
            iconName = focused ? "bicycle" : "bicycle-outline";
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={TodayOrderScreen}
        options={({ navigation }) => ({
          title: "Orders",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={26} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />

      <Tab.Screen
        name="AllOrders"
        component={AllOrdersScreen}
        options={{ title: "All Orders" }}
      />

      <Tab.Screen
        name="PendingPayment"
        component={PendingPaymentScreen}
        options={{ title: "Pending Payment" }}
      />

      <Tab.Screen
        name="Ledger"
        component={LedgerAdminScreen}
        options={{
          title: "Expense",
          headerShown: true,
        }}
      />
      <Tab.Screen name="Delivery" component={DeliveryMainScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
