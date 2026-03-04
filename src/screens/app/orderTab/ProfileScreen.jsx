import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ScreenLayout from "../ScreenLayout";
import { localStore } from "../../../localStore/LocalStore";
import { toast } from "sonner-native";
import { AuthContext } from "../../../constant/AuthProvider";
import {
  Button,
  Dialog,
  Portal,
  PaperProvider,
  Divider,
  Avatar,
} from "react-native-paper";
import { useTheme } from "../../../constant/ThemeContext";
import ThemeSettings from "../../theme/ThemeSetting";

const useStyle = (theme) => {
  return StyleSheet.create({
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
    section: {
      marginTop: 20,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.secondary,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    logoutButton: {
      marginHorizontal: 16,
      marginVertical: 24,
      backgroundColor: theme.logOutBackground + "20", // 20% opacity of red
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.logOutBackground,
    },
    logoutText: {
      color: theme.logOutBackground,
      fontWeight: "600",
      fontSize: 16,
    },
    dialog: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    dialogText: {
      color: theme.text,
      fontSize: 16,
    },
  });
};

const ProfileScreen = () => {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const { logout } = useContext(AuthContext);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

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

  const logOutHandler = async () => {
    hideDialog();
    await logout();
  };

  // Get Initials for Avatar
  const getInitials = () => {
    const f = userData.firstName ? userData.firstName[0] : "";
    const l = userData.lastName ? userData.lastName[0] : "";
    return (f + l).toUpperCase();
  };

  return (
    <PaperProvider>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
          <Dialog.Title style={{ color: theme.text }}>Log Out</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to log out of your account?
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={hideDialog} textColor={theme.secondary}>
              Cancel
            </Button>
            <Button onPress={logOutHandler} textColor={theme.error}>
              Log Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScreenLayout style={styles.container}>
        {/* 1. Header with Avatar */}
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

        {/* 2. Appearance Section */}
       

        {/* 3. Account Actions */}
        <View
          style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={showDialog}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    </PaperProvider>
  );
};

export default ProfileScreen;
