import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SessionCard from './SessionCard';

const ScheduleGrid = ({
  sessions = [],
  teacherSubjects = [],
  selectedSessionIds = [],
  subjectSessionIds = [],
  onSessionClick,
  currentHours = 0,
  requiredHours = 0,
}) => {
  // Group sessions by date and time slot
  const groupedSessions = useMemo(() => {
    const groups = {};

    sessions.forEach((session) => {
      const date = session.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(session);
    });

    // Sort sessions within each date by time
    Object.keys(groups).forEach((date) => {
      groups[date].sort((a, b) => {
        const timeA = a.heureDebut || '';
        const timeB = b.heureDebut || '';
        return timeA.localeCompare(timeB);
      });
    });

    return groups;
  }, [sessions]);

  // Get all unique dates and sort them
  const dates = useMemo(() => {
    return Object.keys(groupedSessions).sort((a, b) => {
      return new Date(a) - new Date(b);
    });
  }, [groupedSessions]);

  const subjectIdSet = useMemo(() => new Set(subjectSessionIds), [subjectSessionIds]);

  // Determine session status
  const getSessionStatus = (session, currentHours = 0, requiredHours = 0) => {
    if (selectedSessionIds.includes(session.id)) {
      return 'selected';
    }

    if (subjectIdSet.has(session.id)) {
      return 'subject';
    }

    // Check if session contains teacher's subjects (teacher is responsible for this session)
    const sessionSubjects = session.matieres || [];
    const hasTeacherSubject = sessionSubjects.some((sessionMat) => {
      // Handle both string and object formats
      const sessionMatName = typeof sessionMat === 'object'
        ? (sessionMat.nom || sessionMat.name || sessionMat.id)
        : sessionMat;
      const sessionMatId = typeof sessionMat === 'object' ? sessionMat.id : null;

      return teacherSubjects.some((teacherMat) => {
        const teacherMatName = typeof teacherMat === 'object'
          ? (teacherMat.nom || teacherMat.name || teacherMat.id)
          : teacherMat;
        const teacherMatId = typeof teacherMat === 'object' ? teacherMat.id : null;

        // Match by ID if both have IDs, otherwise match by name
        if (sessionMatId && teacherMatId) {
          return sessionMatId === teacherMatId;
        }
        return sessionMatName === teacherMatName;
      });
    });

    if (hasTeacherSubject) {
      return 'subject';
    }

    // Check if session is full (support both field name formats)
    const surveillants = session.enseignants || session.surveillants || [];
    const currentSurveillants = surveillants.length || 0;
    const maxSurveillants = session.nbSurveillantsMax || session.maxSurveillants || 0;
    if (maxSurveillants > 0 && currentSurveillants >= maxSurveillants) {
      return 'full'; // Session is full (max surveillants reached)
    }

    // Check if teacher has reached full charge (prevent selection but don't mark as 'full' status)
    // This will be handled in the click handler
    return 'available';
  };

  const formatDateHeader = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return { weekday: 'N/A', date: dateStr, isToday: false };
      }
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      return {
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday,
      };
    } catch (e) {
      return { weekday: 'N/A', date: dateStr, isToday: false };
    }
  };

  if (dates.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          No sessions available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // 1 column on mobile
            md: 'repeat(4, 1fr)', // 4 columns on desktop as requested
          },
          gap: 3, // Increased gap for better spacing
          px: 1,
        }}
      >
        {dates.map((date) => {
          const dateInfo = formatDateHeader(date);
          const daySessions = groupedSessions[date] || [];

          return (
            <Box key={date} sx={{ minWidth: 280 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: dateInfo.isToday ? 'primary.main' : 'background.paper',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: dateInfo.isToday ? 'primary.contrastText' : 'text.primary' }}>
                  {dateInfo.weekday}
                </Typography>
                <Typography variant="body2" sx={{ color: dateInfo.isToday ? 'primary.contrastText' : 'text.secondary' }}>
                  {dateInfo.date}
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {daySessions.length > 0 ? (
                  daySessions.map((session, index) => {
                    const status = getSessionStatus(session, currentHours, requiredHours);
                    const isFullCharge = currentHours >= requiredHours;
                    // Disable if forbidden, session is full, or teacher charge is full
                    const disabled = status === 'forbidden' || status === 'subject' || status === 'full' || (status === 'available' && isFullCharge);

                    return (
                      <SessionCard
                        key={`${session.id}-${index}`}
                        session={session}
                        status={status}
                        disabled={disabled}
                        isChargeFull={isFullCharge && status === 'available'}
                        onClick={() => onSessionClick(session, status)}
                      />
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No sessions
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ScheduleGrid;

