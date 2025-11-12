// ProfileScreen.tsx
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import ScreenLayout from "../ScreenLayout";
import { colors } from "../../../constant/Colors";
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
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "../../../constant/ThemeContext";
import ThemeSettings from "../../theme/ThemeSetting";

const useStyle = (theme) => {
  return useMemo(()=> StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      padding: 36,
      alignItems: "center",
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.text,
    },
    name: {
      fontSize: 22,
      fontWeight: "600",
      marginBottom: 4,
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
  }),[theme])
}
const ProfileScreen = () => {
  const { theme } = useTheme();
  
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  // css
  const styles = useStyle(theme);

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const { logout } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImage: "",
  });
  const [visible, setVisible] = React.useState(false);
  const hideDialog = () => setVisible(false);

  useEffect(() => {
    const fetchLocalUser = async () => {
      try {
        const user = await localStore.getUserInfo();
        // console.log("user info-->>>", user)
        setUserData({
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          profileImage: `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=4CAF50&color=ffffff`,
        });
      } catch (err) {
        toast.error("Error get local store", err);
      }
    };
    fetchLocalUser();
  }, []);

  const handleLogout = async () => {
    setVisible(true);
  };
  const logOutHandler = async () => {
    await logout();
    setVisible(false);
    bottomSheetRef.current?.close();
  };

  return (
    <ScreenLayout style={styles.container}>
      <PaperProvider>
        <Card style={styles.card}>
          <View style={{ alignItems: "center" }}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.email}>{userData.email}</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleOpenSheet}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Portal>
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
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.text, fontSize: 16 }}
                  >
                    Are your sure you want to LogOut ?
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={hideDialog}
                    textColor={theme.text}
                    labelStyle={{ fontWeight: "bold" }}
                  >
                    No
                  </Button>
                  <Button
                    onPress={logOutHandler}
                    textColor={theme.text}
                    labelStyle={{ fontWeight: "bold" }}
                  >
                    Yes
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </Card>
        <ThemeSettings/>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text
              style={{ fontSize: 18, marginBottom: 20, textAlign: "center" }}
            >
              Are you sure you want to log out?
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              <Button
                mode="contained"
                onPress={logOutHandler}
                style={{ backgroundColor: "#f44336" }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
              >
                Yes
              </Button>
              <Button
                mode="outlined"
                onPress={handleCloseSheet}
                labelStyle={{ fontWeight: "bold" }}
              >
                Cancel
              </Button>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </PaperProvider>
    </ScreenLayout>
  );
};

export default ProfileScreen;
