import React, { useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { toast } from "sonner-native";

import { useMutation } from "@apollo/client/react";
import { TOKEN_AUTH } from "../../graphql/Mutation";
import ScreenLayout from "../app/ScreenLayout";
import KisanBasket from "../../assets/svg/KisanBasket";
import { AuthContext } from "../../constant/AuthProvider";
import { useTheme } from "../../constant/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Eye, EyeOff, Lock, User } from "lucide-react-native";

const Login = ({ navigation }) => {
  const { theme } = useTheme();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loginApp, { loading }] = useMutation(TOKEN_AUTH);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: 24,
          paddingBottom: 40,
        },
        logoContainer: {
          alignItems: "center",
          marginTop: 60,
          marginBottom: 40,
        },
        headerContainer: {
          marginBottom: 32,
        },
        title: {
          fontSize: 32,
          fontWeight: "700",
          color: theme.heading,
          letterSpacing: -0.5,
        },
        subtitle: {
          fontSize: 16,
          color: theme.secondary,
          marginTop: 8,
        },
        inputLabel: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.heading,
          marginBottom: 8,
          marginLeft: 4,
        },
        inputContainer: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.primary, // Use Zinc 900 background
          borderColor: theme.border, // Use Zinc 800 border
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 16,
          marginBottom: 20,
          height: 56,
        },
        inputIcon: {
          marginRight: 12,
          opacity: 0.8,
        },
        input: {
          flex: 1,
          height: "100%",
          color: theme.text,
          fontSize: 16,
        },
        button: {
          backgroundColor: theme.textSecondary, // Zinc 50 (Inverted/White)
          height: 56,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 12,
          // Subtle shadow for lift
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        },
        buttonText: {
          color: theme.background, // Zinc 950 (Black text on white button)
          fontSize: 16,
          fontWeight: "600",
        },
        disabledButton: {
          opacity: 0.7,
        },
      }),
    [theme],
  );

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Required", "Please enter both email and password");
      return;
    }

    try {
      const { data } = await loginApp({
        variables: { email, password },
      });

      if (data.tokenCreate?.errors && data.tokenCreate?.errors.length > 0) {
        toast.error("Login Failed", data.tokenCreate.errors[0].message);
      } else {
        const { token, refreshToken, user } = data.tokenCreate;
        await login(user, token, refreshToken);
      }
    } catch (err) {
      toast.error(
        "Network Error",
        "Please check your connection and try again.",
      );
    }
  };

  return (
    <ScreenLayout>
      <KeyboardAwareScrollView
        bottomOffset={100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.logoContainer}>
          <KisanBasket width={120} height={120} />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <Text style={styles.inputLabel}>Email or Username</Text>
        <View style={styles.inputContainer}>
          <User color={theme.secondary} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor={theme.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputContainer}>
          <Lock color={theme.secondary} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={theme.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
          />
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {secureText ? (
              <EyeOff size={20} color={theme.secondary} />
            ) : (
              <Eye size={20} color={theme.secondary} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
};

export default Login;
