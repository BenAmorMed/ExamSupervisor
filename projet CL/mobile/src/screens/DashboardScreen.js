import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Switch } from 'react-native';
import { Text, Button, SegmentedButtons, useTheme, ActivityIndicator, Portal, Dialog, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { teacherAPI } from '../services/api';
import SessionCard from '../components/SessionCard';

const DashboardScreen = ({ navigation }) => {
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data
    const [availableSessions, setAvailableSessions] = useState([]);
    const [mySessions, setMySessions] = useState([]);
    const [subjectSessions, setSubjectSessions] = useState([]);

    // UI State
    const [tabValue, setTabValue] = useState('available');
    const [sortByAvailable, setSortByAvailable] = useState(false);
    const [showWarning, setShowWarning] = useState(true);

    // Dialog State
    const [confirmDialog, setConfirmDialog] = useState({ open: false, session: null, action: null });

    // Transforms
    const transformSession = (session) => ({
        ...session,
        salles: session.salle ? session.salle.map(s => typeof s === 'string' ? { nom: s } : s) : (session.salles || []),
        matieres: session.matieres ? session.matieres.map(m => typeof m === 'string' ? { nom: m } : m) : [],
        enseignants: session.surveillants || session.enseignants || [],
        nbSurveillantsMax: session.maxSurveillants || session.nbSurveillantsMax || 0,
        surveillantsCount: session.surveillantsCount || (session.surveillants?.length) || 0,
    });

    const fetchTeacherData = useCallback(async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (!storedUser) {
                navigation.replace('Login');
                return;
            }
            const currentUser = JSON.parse(storedUser);

            const [allRes, myRes, subRes, userRes] = await Promise.all([
                teacherAPI.getAllSessions(0, 100), // Fetch more for mobile list
                teacherAPI.getMySessions(currentUser.id),
                teacherAPI.getSubjectSessions(currentUser.id),
                teacherAPI.getTeacherInfo(currentUser.id)
            ]);

            setAvailableSessions((allRes.data?.content || []).map(transformSession));
            setMySessions((myRes.data || []).map(transformSession));
            setSubjectSessions((subRes.data || []).map(transformSession));

            if (userRes.data) {
                const updated = { ...currentUser, ...userRes.data };
                if (currentUser.token && !updated.token) updated.token = currentUser.token;
                setUser(updated);
                await AsyncStorage.setItem('user', JSON.stringify(updated));
            } else {
                setUser(currentUser);
            }

        } catch (error) {
            console.error("Fetch Error", error);
            if (error.response?.status === 401) navigation.replace('Login');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigation]);

    useEffect(() => {
        fetchTeacherData();
    }, [fetchTeacherData]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchTeacherData();
    }, [fetchTeacherData]);

    // Calculations
    const GRADE_CHARGES = { 'Professeur': 10, 'Maître de conférences': 8, 'Maître assistant': 6, 'Assistant': 4 };
    const getRequiredHours = () => {
        if (!user) return 0;
        if (user.gradeCharge) return user.gradeCharge;
        if (user.grade?.chargeH) return user.grade.chargeH;
        if (typeof user.grade === 'string') return GRADE_CHARGES[user.grade] || 0;
        return 0;
    };
    const getCurrentHours = () => {
        return mySessions.reduce((total, s) => {
            const start = s.heureDebut || '00:00:00';
            const end = s.heureFin || '00:00:00';
            const [h1, m1] = start.split(':').map(Number);
            const [h2, m2] = end.split(':').map(Number);
            const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            return total + (diff / 60);
        }, 0);
    };

    const requiredHours = getRequiredHours();
    const currentHours = getCurrentHours();
    const isFullCharge = currentHours >= requiredHours;

    const handleAction = (session, status) => {
        const action = status === 'selected' ? 'cancel' : 'select';

        // Additional checks handled by button disabled state in SessionCard
        // But showing confirmation dialog here
        setConfirmDialog({ open: true, session, action });
    };

    const executeAction = async () => {
        const { session, action } = confirmDialog;
        if (!session || !user) return;

        setConfirmDialog({ ...confirmDialog, open: false }); // Close first
        setLoading(true);

        try {
            if (action === 'select') {
                await teacherAPI.selectSession(user.id, session.id);
            } else {
                await teacherAPI.cancelSession(user.id, session.id);
            }
            onRefresh(); // Refresh data
        } catch (error) {
            console.error(error);
            let msg = error.response?.data?.message || 'Action failed.';
            if (typeof error.response?.data === 'string') msg = error.response.data;
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
    };

    // Determine which list to show
    let displayedSessions = [];
    if (tabValue === 'available') {
        // Merge logic similar to web: Map by ID
        const map = new Map();
        availableSessions.forEach(s => map.set(s.id, { ...s, status: 'available' }));
        subjectSessions.forEach(s => {
            if (map.has(s.id)) map.set(s.id, { ...map.get(s.id), status: 'subject' });
            else map.set(s.id, { ...s, status: 'subject' });
        });
        mySessions.forEach(s => {
            if (map.has(s.id)) map.set(s.id, { ...map.get(s.id), status: 'selected' });
            else map.set(s.id, { ...s, status: 'selected' });
        });

        displayedSessions = Array.from(map.values());

        if (sortByAvailable) {
            console.log("Sorting by availability enabled");
            displayedSessions.sort((a, b) => {
                const aCount = a.surveillantsCount !== undefined ? a.surveillantsCount : (a.enseignants?.length || 0);
                const aMax = a.nbSurveillantsMax || 2;
                const aVacancy = aCount < aMax;

                const bCount = b.surveillantsCount !== undefined ? b.surveillantsCount : (b.enseignants?.length || 0);
                const bMax = b.nbSurveillantsMax || 2;
                const bVacancy = bCount < bMax;

                // Log details for the first few comparisons or if specific IDs are involved
                // console.log(`Comparing ID ${a.id} (Vac:${aVacancy}, ${aCount}/${aMax}) vs ID ${b.id} (Vac:${bVacancy}, ${bCount}/${bMax})`);

                if (aVacancy === bVacancy) return 0;
                // Available (true) should come before Full (false)
                // true > false in JS? No, true is 1, false is 0.
                // We want true (-1) to come before false (1).
                return aVacancy ? -1 : 1;
            });
            // Snapshot of the top results
            console.log("Sort complete. Top IDs:", displayedSessions.slice(0, 3).map(s => `${s.id}:${(s.surveillantsCount || 0) < (s.nbSurveillantsMax || 2)}`));
        } else {
            console.log("Sorting by availability disabled");
        }
    } else if (tabValue === 'my') {
        displayedSessions = mySessions.map(s => ({ ...s, status: 'selected' }));
    } else {
        displayedSessions = subjectSessions.map(s => ({ ...s, status: 'subject' }));
    }

    // Filter out subjects from available view if not merged? 
    // Code above merges them and marks status. SessionCard handles status display.

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{user?.prenom} {user?.nom}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
                        Charge: {currentHours}h / {requiredHours}h
                    </Text>
                </View>
                <Button mode="text" onPress={handleLogout} textColor={theme.colors.error}>Logout</Button>
            </View>

            <SegmentedButtons
                value={tabValue}
                onValueChange={setTabValue}
                buttons={[
                    { value: 'available', label: 'All' },
                    { value: 'my', label: 'My' },
                    { value: 'subject', label: 'Subj' },
                ]}
                style={styles.tabs}
            />

            {tabValue === 'available' && (
                <View style={styles.sortContainer}>
                    <Text>Available First</Text>
                    <Switch value={sortByAvailable} onValueChange={setSortByAvailable} />
                </View>
            )}

            {loading && !refreshing ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={displayedSessions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <SessionCard
                            session={item}
                            status={item.status}
                            onAction={handleAction}
                            isFullCharge={isFullCharge}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No sessions found</Text>}
                />
            )}

            {/* Confirmation Portal */}
            <Portal>
                <Dialog visible={confirmDialog.open} onDismiss={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                    <Dialog.Title>{confirmDialog.action === 'select' ? 'Select Session' : 'Cancel Session'}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Are you sure you want to {confirmDialog.action} this session?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setConfirmDialog({ ...confirmDialog, open: false })}>No</Button>
                        <Button onPress={executeAction}>Yes</Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Warning Portal */}
                <Dialog visible={!loading && user && !user.fullCharge && currentHours < requiredHours && showWarning} onDismiss={() => setShowWarning(false)}>
                    <Dialog.Title style={{ color: theme.colors.warning }}>Incomplete Assignment</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            You have not completed your teaching charge ({currentHours}h/{requiredHours}h). Please select more sessions.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowWarning(false)}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        alignItems: 'center',
    },
    tabs: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    list: {
        padding: 16,
    }
});

export default DashboardScreen;
