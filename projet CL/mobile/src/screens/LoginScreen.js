import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme, ActivityIndicator, Snackbar, HelperText, Portal, Dialog } from 'react-native-paper';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);

    const theme = useTheme();

    const [showSettings, setShowSettings] = useState(false);
    const [serverUrl, setServerUrl] = useState('');

    // Load saved URL on mount
    React.useEffect(() => {
        AsyncStorage.getItem('server_url').then(url => {
            if (url) setServerUrl(url);
            else setServerUrl('http://10.0.2.2:8081'); // Default default
        });
    }, []);

    const saveSettings = async () => {
        let formattedUrl = serverUrl;
        if (!formattedUrl.startsWith('http')) {
            formattedUrl = `http://${formattedUrl}`;
        }
        // Remove trailing slash if present
        if (formattedUrl.endsWith('/')) {
            formattedUrl = formattedUrl.slice(0, -1);
        }

        await AsyncStorage.setItem('server_url', formattedUrl);
        setServerUrl(formattedUrl);
        setShowSettings(false);

        setSnackbarVisible(true);
        setError(`Server URL set to: ${formattedUrl}`); // abusing error for snackbar msg
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(email, password);
            const userData = response.data;
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            navigation.replace('Dashboard');
        } catch (err) {
            console.error('Login error:', err);
            let msg = 'An error occurred. Please try again.';

            if (err.code === 'ERR_NETWORK') {
                msg = `Could not connect to server at ${serverUrl || 'default address'}. Check IP/Settings.`;
            } else if (err.response?.status === 401 || err.response?.status === 404) {
                msg = 'Invalid email or password.';
            } else if (err.response?.data?.message) {
                msg = err.response.data.message;
            }

            setError(msg);
            setSnackbarVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => setShowSettings(true)} style={{ padding: 10 }}>
                        <Text style={{ fontSize: 24 }}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Surface style={[styles.logoContainer, { backgroundColor: theme.colors.elevation.level1, shadowColor: theme.colors.primary }]} elevation={4}>
                            <Text style={{ fontSize: 40 }}>🎓</Text>
                        </Surface>
                        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
                            ExamSupervisor
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.textSecondary }}>
                            Connexion à votre espace
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nom d'utilisateur ou Email</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Votre nom d'utilisateur ou email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="account" color={theme.colors.textSecondary} />}
                            style={styles.input}
                            theme={{ roundness: 20 }}
                        />

                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mot de passe</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Votre mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            left={<TextInput.Icon icon="lock" color={theme.colors.textSecondary} />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye" : "eye-off"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                            style={styles.input}
                            theme={{ roundness: 20 }}
                        />

                        {/* Replaced inline error with Snackbar, but keeping logic */}

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            contentStyle={styles.buttonContent}
                            style={styles.button}
                        >
                            Se connecter
                        </Button>

                        <View style={styles.footer}>
                            <TouchableOpacity>
                                <Text style={{ color: theme.colors.textSecondary }}>Se souvenir de moi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Mot de passe oublié?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Settings Dialog */}
            <Portal>
                <Dialog visible={showSettings} onDismiss={() => setShowSettings(false)}>
                    <Dialog.Title>Connetion Settings</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
                            Enter the API URL (e.g., http://192.168.1.15:8081).
                            Use 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to find your computer's IP.
                        </Text>
                        <TextInput
                            label="Server URL"
                            value={serverUrl}
                            onChangeText={setServerUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowSettings(false)}>Cancel</Button>
                        <Button onPress={saveSettings}>Save</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={4000}
                style={{ backgroundColor: theme.colors.error }}
            >
                {error}
            </Snackbar>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    topBar: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    content: {
        padding: 24,
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    form: {
        width: '100%',
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
        fontSize: 12,
        marginLeft: 4,
    },
    input: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: 8,
        borderRadius: 50,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    }
});

export default LoginScreen;
