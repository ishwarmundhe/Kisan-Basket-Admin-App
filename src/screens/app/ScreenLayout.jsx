import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenLayout = ({ children, paddingHorizontal = 5 }) => {
  return (
    <SafeAreaView
      style={[styles.container, { paddingHorizontal: paddingHorizontal }]}
    >
      {children}
    </SafeAreaView>
  );
};
export default ScreenLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:-40
  },
});
