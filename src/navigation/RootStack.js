import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CreateOrderScreen from "../screens/app/orderTab/CreateOrder";
import ProfileScreen from "../screens/app/orderTab/ProfileScreen";
import ProductPriceUpdateScreen from "../screens/app/orderTab/DownloadOrderDetails";
import PersonalInformationScreen from "../screens/app/customerTab/CreateCustomer";
import EditProductVarientPrice from "../screens/app/productsTab/EditProduct";
import BottomTabs from "./BottomTabStack";
import Performance from "../screens/app/Performance";

const RootStack = createNativeStackNavigator();
import { useTheme } from "../constant/ThemeContext";

const RootStackNavigator = () => {
  const {theme} = useTheme();
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: '#fff',
        animation: "slide_from_right",
      }}
    >
      {/* Bottom Tabs entry point */}
      <RootStack.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      {/* Screens outside tab bar */}
      <RootStack.Screen name="createOrder" component={CreateOrderScreen} />
      <RootStack.Screen name="profile" component={ProfileScreen} />
      <RootStack.Screen name="purchasePriceOrder" component={ProductPriceUpdateScreen} />
      <RootStack.Screen name="createCustomer" component={PersonalInformationScreen} />
      <RootStack.Screen name="editVarient" component={EditProductVarientPrice} />
      <RootStack.Screen name="Performance" component={Performance}/>
    </RootStack.Navigator>
  );
};

export default RootStackNavigator;
