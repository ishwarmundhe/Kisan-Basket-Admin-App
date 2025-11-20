import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { screenOptions } from "../constant/Constant";

// Import your two authentication screens
import AuthScreen from "../screens/auth/AuthScreen";
import LoginScreen from "../screens/auth/Login";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        animation: "slide_from_right",
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />

      <Stack.Screen name="AdminLogin" component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
