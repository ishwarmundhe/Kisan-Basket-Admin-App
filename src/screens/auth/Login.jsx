import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import Icon from "react-native-vector-icons/Feather";
import { useMutation } from "@apollo/client/react";
import { TOKEN_AUTH } from "../../graphql/Mutation";
import { toast } from "sonner-native";
import ScreenLayout from "../app/ScreenLayout";
import { colors } from "../../constant/Colors";
import KisanBasket from "../../assets/svg/KisanBasket";
import { AuthContext } from "../../constant/AuthProvider";
import { useTheme } from "../../constant/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
const Login = ({ navigation }) => {
  const { theme } = useTheme();

  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loginApp, { loading }] = useMutation(TOKEN_AUTH);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginTop: 20,
      color: theme.heading,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text,
      marginVertical: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderColor: theme.text,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginTop: 16,
      width: "100%",
    },
    icon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      height: 48,
      color: theme.text,
    },
    eyeIcon: {
      marginLeft: 8,
    },
    button: {
      backgroundColor: theme.textSecondary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 24,
    },
    buttonText: {
      color: theme.text,
      fontSize: 16,
    },
  });

  const handleLogin = async () => {
    try {
      const { data } = await loginApp({
        variables: { email, password },
      });
      console.log(data);

      if (data.tokenCreate?.errors && data.tokenCreate?.errors.length > 0) {
        const errorMsg = data?.tokenCreate?.errors[0].message;
        toast.error("Login Error", errorMsg);
      } else {
        const token = data?.tokenCreate?.token;
        // console.log("new--token->", token)
        const refreshToken = data?.tokenCreate?.refreshToken;
        const user = data?.tokenCreate?.user;
        await login(user, token, refreshToken);
      }
    } catch (err) {
      // console.error("Error", err);
      Alert.alert("Network Error", "Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setSecureText(!secureText);
  };

  return (
    <ScreenLayout>
      <KeyboardAwareScrollView
        bottomOffset={180}
        extraScrollHeight={40}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === "ios"}
        scrollEnabled={true}
        disableScrollOnKeyboardHide={true}
      >
        <View style={{ alignItems: "center", marginTop: 80 }}>
          <KisanBasket />
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#aaa" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username or Email"
            placeholderTextColor={colors.TEXT_COLOR}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#aaa" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.TEXT_COLOR}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Icon
              name={secureText ? "eye" : "eye-off"}
              size={20}
              color={theme.text}
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing In..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
};

export default Login;
