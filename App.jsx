import React, { useState, useEffect } from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { enableScreens } from "react-native-screens";

// Call enableScreens() immediately after import, before any components
enableScreens();

import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Platform, StatusBar, StyleSheet } from "react-native";
import { client } from "./src/client/client";
import { AuthProvider } from "./src/constant/AuthProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navigation from "./src/navigation/Navigation";
import { ThemeProvider } from "./src/constant/ThemeContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import RNBootSplash from "react-native-bootsplash";
import localStore from "./src/utils/localStore";
import ErrorBoundary from "./src/errorBoundry/ErrorBoundry";
import { ApolloProvider } from "@apollo/client/react";

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [themeFromStorage, setThemeFromStorage] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading or preloading assets
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const themeJson = await localStore.getCurrentTheme("theme");
        const theme = themeJson ? JSON.parse(themeJson) : null;
        setThemeFromStorage(theme);
      } catch (e) {
        console.log("App init error:", e);
      } finally {
        setAppIsReady(true);
        RNBootSplash.hide({ fade: true });
      }
    }
    prepare();
  }, []);

  if (!appIsReady) return null;

  console.log("Component Check:", {
    ErrorBoundary: typeof ErrorBoundary,
    Navigation: typeof Navigation,
    ThemeProvider: typeof ThemeProvider,
    AuthProvider: typeof AuthProvider,
    GestureHandlerRootView: typeof GestureHandlerRootView,
    SafeAreaProvider: typeof SafeAreaProvider,
    ApolloProvider: typeof ApolloProvider,
    KeyboardProvider: typeof KeyboardProvider,
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar
            barStyle="light-content"
            translucent={Platform.OS === "android"}
            backgroundColor="transparent"
          />
          <ApolloProvider client={client}>
            <ThemeProvider initialTheme={themeFromStorage}>
              <AuthProvider>
                <KeyboardProvider>
                  <ErrorBoundary>
                    <Navigation />
                  </ErrorBoundary>
                </KeyboardProvider>
              </AuthProvider>
            </ThemeProvider>
          </ApolloProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
});

export default App;
