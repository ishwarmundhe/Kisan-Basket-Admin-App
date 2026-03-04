import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dimensions, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../constant/ThemeContext";

// Screens
import TodayOrderScreen from "../screens/app/orderTab/Order";
import CustomerDetailScreen from "../screens/app/customerTab/CustomerScreen";
import ProductListScreen from "../screens/app/productsTab/ProductList";
import LedgerAdminScreen from "../screens/admin/LedgerAdminScreen"; // Updated import

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
          } else if (route.name === "Product") {
            iconName = focused ? "pricetags" : "pricetags-outline";
          } else if (route.name === "Ledger") {
            iconName = focused ? "wallet" : "wallet-outline";
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        
        name="Home"
        component={TodayOrderScreen}
        options={({ navigation }) => ({
          title: "Today Orders",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("profile")}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen name="Customer" component={CustomerDetailScreen} />
      <Tab.Screen name="Product" component={ProductListScreen} />
      <Tab.Screen
        name="Ledger"
        component={LedgerAdminScreen}
        options={{
          title: "Expense",
          headerShown: true, // Show header for the ledger screen
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
