import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/Login";
import { AUTH_SCREENS } from "../constant/Screens";

const Stack = createNativeStackNavigator();

const AUTH_SCREEN_OPTIONS = {
  animation: "slide_from_right",
  headerShown: false,
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={AUTH_SCREEN_OPTIONS}>
      <Stack.Screen name={AUTH_SCREENS.LOGIN} component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
