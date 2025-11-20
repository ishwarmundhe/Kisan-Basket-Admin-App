import React from "react";

import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../constant/ThemeContext";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create(
      {
        header: {
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 22,
          marginHorizontal: 10,
          // backgroundColor:'#4CAF50'
        },
        headerTitle: {
          fontSize: 14,
          fontWeight: "600",
          color: "#0f172a",
          marginLeft: 10,
        },
        profileImage: {
          width: 40,
          height: 40,
          borderRadius: 20,
        },
      },
      [theme]
    );
  });
};

const Header = ({ name, backButton, navigation, profile = true }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  return (
    <SafeAreaView style={styles.header}>
      {backButton ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 5, left: 5, right: 5, bottom: 5 }}
        >
          <Icon name="arrow-back-outline" size={25} />
        </TouchableOpacity>
      ) : null}
      <Text style={styles.headerTitle}>{name}</Text>
      {profile ? (
        <View style={{ alignItems: "flex-end", flex: 1 }}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/1.jpg",
            }}
            style={styles.profileImage}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};
export default React.memo(Header);
