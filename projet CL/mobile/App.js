import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { CustomDarkTheme, CustomLightTheme } from './src/theme/theme';
import LoginScreen from './src/screens/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createStackNavigator();

export default function App() {
    const colorScheme = useColorScheme();
    // Force dark mode if user prefers or just default to CustomDarkTheme for the 'wow' effect
    // But respecting system is better. Let's start with Dark as default if unsure.
    const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomDarkTheme; // Enforcing Dark Mode for now based on user preference for web

    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await AsyncStorage.getItem('user');
                setInitialRoute(user ? 'Dashboard' : 'Login');
            } catch (e) {
                setInitialRoute('Login');
            }
        };
        checkUser();
    }, []);

    if (!initialRoute) {
        return (
            <PaperProvider theme={theme}>
                <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </PaperProvider>
        );
    }

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer theme={theme}>
                <Stack.Navigator
                    initialRouteName={initialRoute}
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
