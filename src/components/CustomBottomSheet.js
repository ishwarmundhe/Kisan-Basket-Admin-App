import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  TouchableHighlight,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../constant/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../constant/ThemeContext";

const useStyle = (theme) => {
  return useMemo(() => {
  return  StyleSheet.create({
      titleText: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.heading,
      },
      backdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        width: "100%",
        height: "100%",
        justifyContent: "flex-end",
      },
    
      bottomSheet: {
        width: "100%",
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        paddingVertical: 20,
      },
    
      handlerBar: {
        width: 90,
        height: 4,
        backgroundColor: "white",
        borderRadius: 100,
        alignSelf: "center",
        marginTop: -10,
        marginBottom: 20,
      },
      fab: {
        backgroundColor: theme.primary,
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    })
  },[theme])
};

const screenHeight = Dimensions.get("window").height;

const BottomSheet = ({
  setStatus,
  title,
  children,
  addCustomer = false,
  onClose,
  height = "40%",
  backgroundColor = "white",
  fontStyle = "italic",
  textAlign = "center",
  fontSize,
  paddingHorizontal = 10,
  paddingBottom = 0,
  onPress,
}) => {
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  const {theme} = useTheme();
  const styles = useStyle(theme);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardOffset(event.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // console.log("keyboard", keyboardOffset);
  const slide = React.useRef(new Animated.Value(screenHeight)).current;
  const calculateHeight = () => {
    return typeof height === "string" && height.includes("%")
      ? (parseFloat(height) / 100) * screenHeight
      : height;
  };

  const slideUp = () => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const slideDown = () => {
    Animated.timing(slide, {
      toValue: bottomSheetHeight || screenHeight,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setStatus(false);
      if (onClose) onClose();
    });
  };

  useEffect(() => {
    slideUp();
  }, []);

  const bottomSheetHeight = calculateHeight();

  return (
    <SafeAreaView onPress={slideDown} style={styles.backdrop}>
      <Pressable style={{ height: bottomSheetHeight || calculateHeight() }}>
        <Animated.View
          // onLayout={(event) => setBottomSheetHeight(event.nativeEvent.layout.height)}
          style={[
            styles.bottomSheet,
            {
              height: bottomSheetHeight || "auto",
              paddingHorizontal,
              paddingBottom: keyboardOffset > 0 ? keyboardOffset - 15 : 0,
            },
            { transform: [{ translateY: slide }], backgroundColor },
          ]}
        >
          <Pressable onPress={() => {}} style={styles.handlerBar} />
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Text
              style={[styles.titleText, { fontStyle, textAlign, fontSize }]}
            >
              {title}
            </Text>
            {addCustomer && (
              <TouchableHighlight
                style={styles.fab}
                onPress={onPress}
                hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
              >
                <Ionicons name="person-add" size={20} color={"#FFFFFF"} />
              </TouchableHighlight>
            )}
          </View>
          <View style={{ flex: 1 }}>{children}</View>
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
};

export default React.memo(BottomSheet);
