import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import { AuthContext } from "../constant/AuthProvider";
import RootStackNavigator from "./RootStack";
import DeliveryNavigator from "./DeliveryNavigator";
import AdminNavigator from "./AdminNavigator";
import { useTheme } from "../constant/ThemeContext";

export default function Navigation() {
  const { token, isLoading, user } = useContext(AuthContext);
  const { theme } = useTheme();

  console.log(user);

  const userRole = user?.role;
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.background,
      card: theme.cardBackground,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderNavigator = () => {
    if (!token) {
      return <AuthStack />;
    }

    switch (userRole) {
      case "ADMIN":
        return <AdminNavigator />;
      case "DELIVERY":
        return <DeliveryNavigator />;
      default:
        return <RootStackNavigator />;
    }
  };

  return (
    <NavigationContainer theme={MyTheme}>
      {renderNavigator()}
    </NavigationContainer>
  );
}
