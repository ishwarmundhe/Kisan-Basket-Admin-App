import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
} from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "../constant/ThemeContext";
const useStyle = (theme) => {
  return useMemo(() => {
  return  StyleSheet.create({
      container: {
        flex:1
        },
        contentContainer: {
          backgroundColor: theme.text,
          padding: 16,
        },
    })
  })
}
const ReusableBottomSheet = forwardRef((props, ref) => {
  const {theme} = useTheme();

  const styles = useStyle(theme);

  const {
    children,
    snapPoints = ["40%", "100%"], // ✅ Valid snap points
    enableScroll = false,
    contentContainerStyle = {},
  } = props;

  const sheetRef = useRef(null);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.snapToIndex(snapPoints.length - 1), // ✅ Open to full height
    expand: () => sheetRef.current?.expand(),
    collapse: () => sheetRef.current?.collapse(),
    close: () => sheetRef.current?.close(),
    snapToIndex: (index) => sheetRef.current?.snapToIndex(index),
  }));

  const renderContent = () => {
    if (enableScroll) {
      return (
        <BottomSheetScrollView
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        >
          {children}
        </BottomSheetScrollView>
      );
    }
    return (
      <BottomSheetView style={[styles.contentContainer, contentContainerStyle]}>
        {children}
      </BottomSheetView>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true} // ✅ Allow swipe down to close
          enableDynamicSizing={false}
        >
          {renderContent()}
        </BottomSheet>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
});
export default ReusableBottomSheet;
