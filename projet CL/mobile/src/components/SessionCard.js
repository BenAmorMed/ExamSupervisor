import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip, useTheme, IconButton } from 'react-native-paper';

const SessionCard = ({ session, onAction, status, isFullCharge }) => {
    const theme = useTheme();

    // Helper to format list of objects or strings to string
    const formatList = (list) => {
        if (!list) return '';
        return list.map(item => typeof item === 'string' ? item : item.nom || item.name || '').join(', ');
    };

    const date = new Date(session.date).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    const time = `${session.heureDebut?.substring(0, 5)} - ${session.heureFin?.substring(0, 5)}`;
    const rooms = formatList(session.salles || session.salle);
    const subjects = formatList(session.matieres);

    // Calculate vacancy
    const currentSurveillants = session.enseignants?.length || session.surveillants?.length || 0;
    const maxSurveillants = session.nbSurveillantsMax || session.maxSurveillants || 2;
    const isFull = currentSurveillants >= maxSurveillants;

    // Determine Button State
    let buttonLabel = 'Select';
    let buttonMode = 'contained';
    let buttonDisabled = false;
    let buttonColor = theme.colors.primary;

    if (status === 'selected') {
        buttonLabel = 'Cancel';
        buttonMode = 'outlined';
        buttonColor = theme.colors.error;
    } else if (status === 'subject') {
        buttonLabel = 'Responsable';
        buttonDisabled = true;
    } else if (status === 'forbidden') {
        buttonLabel = 'Conflict';
        buttonDisabled = true;
    } else if (isFull) {
        buttonLabel = 'Full';
        buttonDisabled = true;
    } else if (isFullCharge) {
        // If user has full charge, they can't select more
        buttonDisabled = true;
    }

    return (
        <Card style={[styles.card, { borderColor: theme.colors.elevation.level3 }]}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.dateContainer}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>{date}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.textSecondary }}>{time}</Text>
                    </View>
                    {status === 'selected' && <Chip icon="check" style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)' }} textStyle={{ color: '#4caf50' }}>Selected</Chip>}
                </View>

                <View style={styles.row}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', width: 60, color: theme.colors.textSecondary }}>Rooms:</Text>
                    <Text variant="bodyMedium" style={{ flex: 1 }}>{rooms}</Text>
                </View>
                <View style={styles.row}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', width: 60, color: theme.colors.textSecondary }}>Subjects:</Text>
                    <Text variant="bodyMedium" style={{ flex: 1 }}>{subjects}</Text>
                </View>
                <View style={styles.row}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', width: 60, color: theme.colors.textSecondary }}>Staff:</Text>
                    <Text variant="bodyMedium" style={{ flex: 1, color: isFull ? theme.colors.error : theme.colors.success }}>
                        {currentSurveillants} / {maxSurveillants}
                    </Text>
                </View>
            </Card.Content>
            <Card.Actions style={styles.actions}>
                <Button
                    mode={buttonMode}
                    onPress={() => onAction(session, status)}
                    disabled={buttonDisabled}
                    textColor={buttonMode === 'outlined' ? buttonColor : theme.colors.onPrimary}
                    buttonColor={buttonMode === 'contained' ? buttonColor : undefined}
                    style={{ borderColor: buttonColor }}
                >
                    {buttonLabel}
                </Button>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    dateContainer: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    actions: {
        justifyContent: 'flex-end',
        paddingRight: 16,
        paddingBottom: 12,
    }
});

export default SessionCard;
