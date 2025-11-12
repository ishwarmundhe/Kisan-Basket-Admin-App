import {useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AuthStack from './AuthStack';
import { AuthContext } from '../constant/AuthProvider';
import RootStackNavigator from './RootStack';
import { useTheme } from '../constant/ThemeContext';

export default function Navigation(){
    const { token, isLoading } = useContext(AuthContext);
    const { theme } = useTheme();
    const MyTheme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.background,
        card: theme.cardBackground,
        text: theme.text,
        border: theme.border,
        primary: theme.primary,
      },
    };
  
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
  
    return (
      <NavigationContainer theme={MyTheme}>
        {token ? <RootStackNavigator /> : <AuthStack />}
      </NavigationContainer>
    );
  
  };
