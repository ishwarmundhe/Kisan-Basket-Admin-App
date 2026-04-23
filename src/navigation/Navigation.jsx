import { useContext, useMemo } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import { AuthContext } from "../constant/AuthProvider";
import RootStackNavigator from "./RootStack";
import { useTheme } from "../constant/ThemeContext";

export default function Navigation() {
  const { token, isLoading } = useContext(AuthContext);
  const { theme } = useTheme();

  const MyTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.background,
        card: theme.cardBackground,
        text: theme.text,
        border: theme.border,
        primary: theme.primary,
      },
    }),
    [theme],
  );

  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      {token ? <RootStackNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
