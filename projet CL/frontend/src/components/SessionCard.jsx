import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  Room,
  School,
  People,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const SessionCard = ({
  session,
  status, // 'available', 'selected', 'forbidden', 'full'
  onClick,
  disabled = false,
  isChargeFull = false, // Teacher has reached full charge
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getStatusColor = () => {
    switch (status) {
      case 'selected':
        return {
          bg: isDark ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9',
          border: isDark ? '#4caf50' : '#4caf50',
          text: isDark ? '#81c784' : '#2e7d32'
        };
      case 'available':
        return {
          bg: isDark ? 'rgba(33, 150, 243, 0.15)' : '#e3f2fd',
          border: isDark ? '#2196f3' : '#2196f3',
          text: isDark ? '#64b5f6' : '#1565c0'
        };
      case 'forbidden':
        return {
          bg: isDark ? 'rgba(244, 67, 54, 0.15)' : '#ffebee',
          border: isDark ? '#f44336' : '#f44336',
          text: isDark ? '#e57373' : '#c62828'
        };
      case 'subject':
        return {
          bg: isDark ? 'rgba(211, 47, 47, 0.15)' : '#ffebee',
          border: isDark ? '#d32f2f' : '#d32f2f',
          text: isDark ? '#ef5350' : '#b71c1c'
        };
      case 'full':
        return {
          bg: isDark ? 'rgba(251, 192, 45, 0.15)' : '#fff9c4',
          border: isDark ? '#fbc02d' : '#fbc02d',
          text: isDark ? '#fff176' : '#f57f17'
        };
      default:
        return {
          bg: isDark ? 'rgba(158, 158, 158, 0.15)' : '#f5f5f5',
          border: isDark ? '#9e9e9e' : '#9e9e9e',
          text: isDark ? '#bdbdbd' : '#616161'
        };
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'selected':
        return 'Selected';
      case 'available':
        return 'Available';
      case 'forbidden':
        return 'You are responsible for this session';
      case 'subject':
        return 'Subject session';
      case 'full':
        return 'Full';
      default:
        return 'Unavailable';
    }
  };

  const colors = getStatusColor();
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:mm
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getRemainingSeats = () => {
    // Support both field name formats
    const maxSurveillants = session.nbSurveillantsMax || session.maxSurveillants || 0;
    const surveillants = session.enseignants || session.surveillants || [];
    if (!maxSurveillants) return null;
    const current = surveillants.length || 0;
    const remaining = maxSurveillants - current;
    return remaining > 0 ? remaining : 0;
  };

  const remainingSeats = getRemainingSeats();

  const cardContent = (
    <Card
      sx={{
        height: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `2px solid ${colors.border}`,
        bgcolor: colors.bg,
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled
          ? {}
          : {
            transform: 'translateY(-2px)',
            boxShadow: 4,
            border: `2px solid ${colors.border}`,
          },
      }}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {formatDate(session.date)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 16, color: colors.text }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                {formatTime(session.heureDebut)} - {formatTime(session.heureFin)}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={getStatusLabel()}
            size="small"
            sx={{
              bgcolor: colors.border,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Only show matieres for subject sessions (teacher's own subjects) */}
        {status === 'subject' && session.matieres && session.matieres.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <School sx={{ fontSize: 14, color: colors.text }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Subject{session.matieres.length > 1 ? 's' : ''}:
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {session.matieres.map((matiere, idx) => (
                <Chip
                  key={idx}
                  label={matiere.nom || matiere}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'white',
                    color: colors.text,
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {(session.salles || session.salle) && (session.salles?.length > 0 || session.salle?.length > 0) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Room sx={{ fontSize: 14, color: colors.text }} />
            <Typography variant="caption" color="text.secondary">
              {(session.salles || session.salle || []).map((salle) =>
                typeof salle === 'string' ? salle : (salle.nom || salle)
              ).join(', ')}
            </Typography>
          </Box>
        )}

        {remainingSeats !== null && status === 'available' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People sx={{ fontSize: 14, color: colors.text }} />
            <Typography variant="caption" color="text.secondary">
              {remainingSeats} seat{remainingSeats !== 1 ? 's' : ''} remaining
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (disabled) {
    let tooltipMessage = '';
    if (status === 'forbidden') {
      tooltipMessage = "You are responsible for this session (you teach this subject)";
    } else if (status === 'subject') {
      tooltipMessage = "This session includes one of your subjects";
    } else if (status === 'full') {
      tooltipMessage = "Session is full (max surveillants reached)";
    } else if (isChargeFull) {
      tooltipMessage = "You have reached your full teaching charge";
    }

    if (tooltipMessage) {
      return (
        <Tooltip
          title={tooltipMessage}
          arrow
        >
          {cardContent}
        </Tooltip>
      );
    }
  }

  return cardContent;
};

export default SessionCard;

