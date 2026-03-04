import React, { useState, useEffect } from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { enableScreens } from "react-native-screens";
import "./global.css";

enableScreens();

import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  Platform,
  StatusBar,
  StyleSheet,
  Appearance,
} from "react-native";
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
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { Toaster } from "sonner-native";

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  const [themeName, setThemeName] = useState("dark");

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const storedTheme = await localStore.getCurrentTheme("theme");

        if (storedTheme) {
          const cleanTheme = storedTheme.replace(/['"]+/g, "");
          setThemeName(cleanTheme);
        }
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

  const statusBarStyle =
    themeName === "dark" ? "light-content" : "dark-content";

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.root}>
          {/* DYNAMIC STATUS BAR */}
          <StatusBar
            animated={true}
            barStyle={statusBarStyle}
            translucent={Platform.OS === "android"}
            backgroundColor="transparent"
          />

          <ApolloProvider client={client}>
            <Provider store={store}>
              <ThemeProvider initialTheme={themeName}>
                <AuthProvider>
                  <KeyboardProvider>
                    <ErrorBoundary>
                      <Navigation />
                      <Toaster />
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
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
});

export default App;
