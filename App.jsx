import React from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { enableScreens } from "react-native-screens";
import "./global.css";

enableScreens();

import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Platform, StatusBar, StyleSheet } from "react-native";
import { client } from "./src/client/client";
import { AuthProvider } from "./src/constant/AuthProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navigation from "./src/navigation/Navigation";
import { ThemeProvider } from "./src/constant/ThemeContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import ErrorBoundary from "./src/errorBoundry/ErrorBoundry";
import { ApolloProvider } from "@apollo/client/react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { Toaster } from "sonner-native";
import { useTokenManager } from "./src/hook/useTokenManager";

const AppInitializer = ({ children }) => {
  useTokenManager();
  return <>{children}</>;
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar
            animated={true}
            translucent={Platform.OS === "android"}
            backgroundColor="transparent"
          />
          <ApolloProvider client={client}>
            <Provider store={store}>
              <ThemeProvider initialTheme={"dark"}>
                <AuthProvider>
                  <KeyboardProvider>
                    <ErrorBoundary>
                      <AppInitializer>
                        <Navigation />
                        <Toaster />
                      </AppInitializer>
                    </ErrorBoundary>
                  </KeyboardProvider>
                </AuthProvider>
              </ThemeProvider>
            </Provider>
          </ApolloProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  root: { flex: 1 },
});

export default App;
