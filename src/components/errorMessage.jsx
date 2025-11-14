import { StyleSheet, View, Text } from "react-native";
import { useTheme } from "../constant/ThemeContext";
import { useMemo } from "react";
const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create(
      {
        container: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        errorText: {
          color: theme.heading,
          fontSize: 18,
          textAlign: "center",
        },
      },
      [theme]
    );
  });
};
const ErrorMessage = ({ errorMessage }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>
        {errorMessage?.message?.includes("Network request failed")
          ? "No internet connection. Please check your network."
          : errorMessage?.message || "Something went wrong."}
      </Text>
    </View>
  );
};
export default ErrorMessage;
