import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import TodayOrderScreen from "../screens/app/orderTab/Order";
import CustomerDetailScreen from "../screens/app/customerTab/CustomerScreen";
import ProductListScreen from "../screens/app/productsTab/ProductList";
import { useTheme } from "../constant/ThemeContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#C8E6C9",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Customer") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Product") {
            iconName = focused ? "pricetags" : "pricetags-outline";
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
    </Tab.Navigator>
  );
};

export default BottomTabs;
