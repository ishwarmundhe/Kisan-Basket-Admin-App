import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";

import DeliveryOnboarding from "../screens/delivery/DeliveryOnboarding";
import DeliveryDashboard from "../screens/delivery/DeliveryDashboard";
import AssignedOrders from "../screens/delivery/AssignedOrders";
import OrderDetailsEnhanced from "../screens/delivery/OrderDetailsEnhanced";
import OrderDetails from "../screens/delivery/OrderDetails";
import DeliveryHistory from "../screens/delivery/DeliveryHistory";
import DeliveryProfile from "../screens/delivery/DeliveryProfile";
import DeliveryTabNavigator from "../navigation/BottomNavigation/DeliveryTabNavigator";
// Import icons
import { Home, Package, Clock, User } from "lucide-react-native";

const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainAppStack() {
  const navigation = useNavigation();

  const handleBackToDashboard = () => {
    navigation.goBack();
  };

  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="MainTabs"
        component={DeliveryTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="OrderDetails"
        options={{
          headerShown: false,
          //title: "Order Details",
        }}
      >
        {(props) => (
          <OrderDetails
            order={props.route.params.order}
            onBack={handleBackToDashboard}
          />
        )}
      </MainStack.Screen>
    </MainStack.Navigator>
  );
}

export default function DeliveryNavigator() {
  const [isApproved, setIsApproved] = useState(false);

  const handleOnboardingComplete = () => {
    setIsApproved(true);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {true ? (
        <Stack.Screen name="Main" component={MainAppStack} />
      ) : (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <DeliveryOnboarding
              {...props}
              onComplete={handleOnboardingComplete}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
