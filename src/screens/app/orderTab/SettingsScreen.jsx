import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ScreenLayout from "../ScreenLayout";
import { AuthContext } from "../../../constant/AuthProvider";
import { Button, Dialog, Portal, PaperProvider, Divider } from "react-native-paper";
import { useTheme } from "../../../constant/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

const useStyle = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: theme.cardBackground,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.text,
  },
  logoutText: {
    color: theme.logOutBackground || "#ef4444",
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

const SettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const { logout } = useContext(AuthContext);

  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const logOutHandler = async () => {
    hideDialog();
    await logout();
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
            <Button onPress={hideDialog} textColor={theme.secondary}>Cancel</Button>
            <Button onPress={logOutHandler} textColor={theme.error || "#ef4444"}>Log Out</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScreenLayout style={styles.container}>
        <View style={{ borderRadius: 12, overflow: "hidden", marginHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("profile")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={theme.text} />
              <Text style={styles.menuText}>Profile Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>
          <Divider style={{ backgroundColor: theme.border }} />

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("ProductList")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="pricetags-outline" size={24} color={theme.text} />
              <Text style={styles.menuText}>Manage Products</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>
          <Divider style={{ backgroundColor: theme.border }} />

         <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("customer")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="pricetags-outline" size={24} color={theme.text} />
              <Text style={styles.menuText}>Customer</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>
          <Divider style={{ backgroundColor: theme.border }} />
 <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("allOrders")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="pricetags-outline" size={24} color={theme.text} />
              <Text style={styles.menuText}>All Orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>
          <Divider style={{ backgroundColor: theme.border }} />


          <TouchableOpacity style={styles.menuItem} onPress={showDialog}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color={theme.logOutBackground || "#ef4444"} />
              <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScreenLayout>
    </PaperProvider>
  );
};

export default SettingsScreen;
