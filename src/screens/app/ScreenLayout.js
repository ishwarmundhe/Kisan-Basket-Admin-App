import {
    StyleSheet,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
const ScreenLayout = ({ children, paddingHorizontal = 16 }) => {
    return (
        <SafeAreaView style={[styles.container,  {paddingHorizontal: paddingHorizontal,}]}>
            {children}
        </SafeAreaView>
    );
};
export default ScreenLayout;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
    },
});
