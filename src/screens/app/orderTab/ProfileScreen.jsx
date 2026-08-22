import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenLayout from "../ScreenLayout";
import { localStore } from "../../../utils/localStore";
import { toast } from "sonner-native";
import { Avatar } from "react-native-paper";
import { useTheme } from "../../../constant/ThemeContext";

const useStyle = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  headerSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: theme.background,
  },
  avatarContainer: {
    backgroundColor: theme.primary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatarLabel: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "600",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 14,
    color: theme.secondary,
    marginTop: 4,
  },
});

const ProfileScreen = () => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const fetchLocalUser = async () => {
      try {
        const user = await localStore.getUserInfo();
        if (user) {
          setUserData({
            firstName: user.firstName || "Guest",
            lastName: user.lastName || "",
            email: user.email || "No email",
          });
        }
      } catch (err) {
        toast.error("Error getting local store");
      }
    };
    fetchLocalUser();
  }, []);

  const getInitials = () => {
    const f = userData.firstName ? userData.firstName[0] : "";
    const l = userData.lastName ? userData.lastName[0] : "";
    return (f + l).toUpperCase();
  };

  return (
    <ScreenLayout style={styles.container}>
      <View style={styles.headerSection}>
        <Avatar.Text
          size={80}
          label={getInitials()}
          style={styles.avatarContainer}
          labelStyle={styles.avatarLabel}
          color={theme.text}
        />
        <Text style={styles.name}>
          {userData.firstName} {userData.lastName}
        </Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>
    </ScreenLayout>
  );
};

export default ProfileScreen;
