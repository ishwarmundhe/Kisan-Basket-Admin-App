import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/auth/Login";
import { screenOptions } from "../constant/Constant";

const Stack = createNativeStackNavigator();

const  AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{...screenOptions,  animation: "slide_from_right",}}>
         <Stack.Screen name="signin" component={Login} />
        </Stack.Navigator>
    )
};
export default AuthStack
