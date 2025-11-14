// ProfileScreen.jsx
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
  Card,
} from "react-native-paper";
import { useTheme } from "../../../constant/ThemeContext";
import ThemeSettings from "../../theme/ThemeSetting";
// import ReusableBottomSheet from "../../../components/bottomSheet"; // No longer needed here

// Styles
const useStyle = (theme) => {
  return StyleSheet.create({
    container: { flex: 1 },

    name: {
      fontSize: 22,
      fontWeight: "600",
      color: theme.text,
    },

    email: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 24,
    },

    logoutButton: {
      backgroundColor: theme.logOutBackground,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },

    logoutText: {
      color: theme.text,
      fontWeight: "600",
      fontSize: 16,
    },

    card: {
      paddingVertical: 15,
      backgroundColor: theme.primary,
      borderColor: theme.border,
      borderWidth: 1,
    },

    // sheetContent removed as bottom sheet is no longer used
  });
};

const ProfileScreen = () => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  // Removed bottomSheetRef and snapPoints

  const { logout } = useContext(AuthContext);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true); // Renamed for clarity
  const hideDialog = () => setVisible(false);

  useEffect(() => {
    const fetchLocalUser = async () => {
      try {
        const user = await localStore.getUserInfo();
        setUserData({
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
        });
      } catch (err) {
        toast.error("Error getting local store", err);
      }
    };
    fetchLocalUser();
  }, []);

  // Removed handleOpenSheet and handleCloseSheet

  const logOutHandler = async () => {
    await logout();
    setVisible(false);
    // No longer need to close bottom sheet
  };

  return (
    <PaperProvider>
      <Portal>
        {/* Logout Dialog */}
        <Dialog
          visible={visible}
          onDismiss={hideDialog}
          style={{
            backgroundColor: theme.primary,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Dialog.Content>
            <Text style={{ color: theme.text, fontSize: 16 }}>
              Are you sure you want to LogOut?
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={hideDialog} textColor={theme.text}>
              No
            </Button>
            <Button onPress={logOutHandler} textColor={theme.text}>
              Yes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScreenLayout style={styles.container}>
        <Card style={styles.card}>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.name}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.email}>{userData.email}</Text>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={showDialog} // Changed to open dialog directly
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <ThemeSettings />

        {/* Reusable Bottom Sheet removed */}
      </ScreenLayout>
    </PaperProvider>
  );
};

export default ProfileScreen;
