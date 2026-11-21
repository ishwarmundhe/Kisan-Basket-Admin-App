import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../constant/ThemeContext";

// Screens
import CreateOrderScreen from "../screens/app/orderTab/CreateOrder";
import ProfileScreen from "../screens/app/orderTab/ProfileScreen";
import ProductPriceUpdateScreen from "../screens/app/orderTab/DownloadOrderDetails";
import PersonalInformationScreen from "../screens/app/customerTab/CreateCustomer";
import EditProductVarientPrice from "../screens/app/productsTab/EditProduct";
import Performance from "../screens/app/Performance";
import LedgerAdminScreen from "../screens/admin/LedgerAdminScreen";
import BottomTabs from "./BottomTabStack";

// Newly Added Screens for Stack
import SettingsScreen from "../screens/app/orderTab/SettingsScreen";
import ProductListScreen from "../screens/app/productsTab/ProductList";
import CustomerDetailScreen from "../screens/app/customerTab/CustomerScreen";
import AllOrdersScreen from "../screens/app/orderTab/AllOrdersScreen";
import StockManagementScreen from "../screens/app/orderTab/StockManagementScreen";
import StockManagementDetailScreen from "../screens/app/orderTab/StockManagementDetailScreen";
import WhatsAppChatListScreen from "../screens/app/whatsappChat/WhatsAppChatListScreen";
import WhatsAppChatThreadScreen from "../screens/app/whatsappChat/WhatsAppChatThreadScreen";

const RootStack = createNativeStackNavigator();

const RootStackNavigator = () => {
  const { theme } = useTheme();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: "#fff",
        animation: "slide_from_right",
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      <RootStack.Screen
        name="StockManagement"
        component={StockManagementScreen}
        options={{ title: "Products" }}
      />
      <RootStack.Screen
        name="StockManagementDetail"
        component={StockManagementDetailScreen}
        options={{ title: "Product Details" }}
      />

      <RootStack.Screen name="createOrder" component={CreateOrderScreen} />

      <RootStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />

      <RootStack.Screen
        name="profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />

      <RootStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: "Manage Products" }}
      />

      <RootStack.Screen
        name="customer"
        component={CustomerDetailScreen}
        options={{ title: "Customers" }}
      />

      <RootStack.Screen
        name="allOrders"
        component={AllOrdersScreen}
        options={{ title: "All Orders" }}
      />

      <RootStack.Screen
        name="purchasePriceOrder"
        component={ProductPriceUpdateScreen}
      />
      <RootStack.Screen
        name="createCustomer"
        component={PersonalInformationScreen}
      />
      <RootStack.Screen
        name="editVarient"
        component={EditProductVarientPrice}
      />
      <RootStack.Screen name="Performance" component={Performance} />

      <RootStack.Screen
        name="LedgerFull"
        component={LedgerAdminScreen}
        options={{
          title: "Ledger Management",
        }}
      />
      <RootStack.Screen
        name="WhatsAppChat"
        component={WhatsAppChatListScreen}
        options={{ title: "WhatsApp Live Chat" }}
      />
      <RootStack.Screen
        name="WhatsAppChatThread"
        component={WhatsAppChatThreadScreen}
        options={{ title: "Chat" }}
      />

    </RootStack.Navigator>
  );
};

export default RootStackNavigator;
