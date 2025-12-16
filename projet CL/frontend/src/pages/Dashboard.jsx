import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Pagination,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { AutoAwesome, Print } from '@mui/icons-material';
import TeacherInfoHeader from '../components/TeacherInfoHeader';
import ScheduleGrid from '../components/ScheduleGrid';
import { teacherAPI } from '../services/api';

const Dashboard = () => {
  // Fallback for grade charges if backend (DTO) fails to provide them
  const GRADE_CHARGES = {
    'Professeur': 10,
    'Maître de conférences': 8,
    'Maître assistant': 6,
    'Assistant': 4,
  };

  const [user, setUser] = useState(null);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [subjectSessions, setSubjectSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, session: null, action: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [sortByAvailable, setSortByAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Transform session data to match frontend expectations
  const transformSession = (session) => {
    return {
      ...session,
      // Map salle (array of strings) to salles (array of objects with nom)
      salles: session.salle
        ? session.salle.map(s => typeof s === 'string' ? { nom: s } : s)
        : session.salles || [],
      // Map matieres (array of strings) to objects if needed
      matieres: session.matieres
        ? session.matieres.map(m => typeof m === 'string' ? { nom: m } : m)
        : [],
      // Map surveillants to enseignants
      enseignants: session.surveillants || session.enseignants || [],
      // Map maxSurveillants to nbSurveillantsMax
      nbSurveillantsMax: session.maxSurveillants || session.nbSurveillantsMax || 0,
    };
  };

  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1); // 1-indexed for MUI Pagination
  const pageSize = 8; // 8 items per page for 4-column layout (2 rows)

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const fetchTeacherData = async () => {
    if (!user || !user.id) return;

    setLoading(true);
    try {
      // Fetch paginated sessions (page - 1 for backend 0-indexing)
      // Note: We only paginate 'Available Sessions' (All Sessions) for now
      const [allSessionsRes, mySessionsRes, subjectRes, userRes] = await Promise.all([
        teacherAPI.getAllSessions(page - 1, pageSize),
        teacherAPI.getMySessions(user.id),
        teacherAPI.getSubjectSessions(user.id),
        teacherAPI.getTeacherInfo(user.id),
      ]);

      // Handle Page<Dto> response structure for allSessions
      const sessionsData = allSessionsRes.data?.content || [];
      setTotalPages(allSessionsRes.data?.totalPages || 0);

      // Transform sessions to match expected format
      const transformedAvailable = sessionsData.map(transformSession);
      const transformedMySessions = (mySessionsRes.data || []).map(transformSession);
      const transformedSubject = (subjectRes.data || []).map(transformSession);

      setAvailableSessions(transformedAvailable);
      setMySessions(transformedMySessions);
      setSubjectSessions(transformedSubject);

      // Update user data with fresh data from server (including correct grade/charge)
      console.log('User response:', userRes.data);
      if (userRes.data) {
        const updatedUser = { ...user, ...userRes.data };
        if (user.token && !updatedUser.token) {
          updatedUser.token = user.token;
        }
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTeacherData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, page]); // Refetch when page changes

  const calculateRequiredHours = () => {
    if (!user || !user.grade) return 0;
    // Match backend logic: isFullCharge() uses grade.getChargeH() directly
    // Backend: chargeMinutes = grade.getChargeH() * 60L

    // Priority 1: DTO provides explicit charge
    if (user.gradeCharge !== undefined && user.gradeCharge > 0) return user.gradeCharge;

    // Priority 2: User object has Grade entity (old backend style)
    if (user.grade?.chargeH) return user.grade.chargeH;

    // Priority 3: Grade is a string (new DTO) but charge is missing -> Use Fallback Map
    if (typeof user.grade === 'string') {
      const fallbackCharge = GRADE_CHARGES[user.grade];
      if (fallbackCharge) return fallbackCharge;
    }

    return 0; // Unknown grade or data missing
  };

  const calculateCurrentHours = () => {
    return mySessions.reduce((total, session) => {
      const start = session.heureDebut || '00:00:00';
      const end = session.heureFin || '00:00:00';
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      const startMin = h1 * 60 + m1;
      const endMin = h2 * 60 + m2;
      return total + (endMin - startMin) / 60;
    }, 0);
  };

  const handleSessionClick = (session, status) => {
    // Prevent clicking if full charge is reached
    const isFullCharge = currentHours >= requiredHours;
    if (
      status === 'forbidden' ||
      status === 'subject' ||
      status === 'full' ||
      (status === 'available' && isFullCharge)
    ) {
      if (isFullCharge && status === 'available') {
        showSnackbar('You have reached your full teaching charge. Cannot select more sessions.', 'warning');
      }
      if (status === 'subject') {
        showSnackbar('This session includes one of your subjects and cannot be selected.', 'info');
      }
      return;
    }

    const action = status === 'selected' ? 'cancel' : 'select';
    setConfirmDialog({
      open: true,
      session,
      action,
    });
  };

  const handleConfirmAction = async () => {
    const { session, action } = confirmDialog;
    if (!session || !user) return;

    try {
      if (action === 'select') {
        await teacherAPI.selectSession(user.id, session.id);
        showSnackbar('Session selected successfully!', 'success');
      } else {
        await teacherAPI.cancelSession(user.id, session.id);
        showSnackbar('Session canceled successfully!', 'success');
      }

      setConfirmDialog({ open: false, session: null, action: null });
      // Refresh data
      await fetchTeacherData();
    } catch (error) {
      console.error('Error performing action:', error);

      let errorMsg = 'An error occurred. Please try again.';

      if (error.response) {
        // Backend returns simple string or JSON object
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        }
      }

      showSnackbar(errorMsg, 'error');
    }
  };

  const handleAutoAssign = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'This will automatically assign sessions to complete your teaching charge. Continue?'
    );

    if (!confirmed) return;

    setAutoAssigning(true);
    try {
      await teacherAPI.autoAssign(user.id);
      showSnackbar('Sessions assigned automatically!', 'success');
      await fetchTeacherData();
    } catch (error) {
      console.error('Error auto-assigning:', error);
      const errorMsg = error.response?.data?.message || 'Failed to assign sessions automatically.';
      showSnackbar(errorMsg, 'error');
    } finally {
      setAutoAssigning(false);
    }
  };

  const handlePrintSchedule = () => {
    // Check if charge is complete
    if (currentHours < requiredHours) {
      showSnackbar('You must complete your teaching charge before printing your schedule.', 'warning');
      return;
    }

    const sessionMap = new Map();

    subjectSessions.forEach((session) => {
      sessionMap.set(session.id, {
        session,
        tags: new Set(['subject']),
      });
    });

    mySessions.forEach((session) => {
      if (!sessionMap.has(session.id)) {
        sessionMap.set(session.id, {
          session,
          tags: new Set(),
        });
      }
      sessionMap.get(session.id).tags.add('selected');
    });

    if (sessionMap.size === 0) {
      showSnackbar('No sessions to print yet.', 'info');
      return;
    }

    const parseDate = (session) => {
      const dateStr = session.date ? `${session.date}T${session.heureDebut || '00:00'}` : '';
      const dateObj = new Date(dateStr);
      return isNaN(dateObj.getTime()) ? null : dateObj;
    };

    const formatDate = (session) => {
      const dateObj = parseDate(session);
      if (!dateObj) {
        return session.date || 'N/A';
      }
      return dateObj.toLocaleDateString('fr-FR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const formatTime = (session) => {
      const start = session.heureDebut?.substring(0, 5) || '00:00';
      const end = session.heureFin?.substring(0, 5) || '00:00';
      return `${start} - ${end}`;
    };

    const printableEntries = Array.from(sessionMap.values()).sort((a, b) => {
      const dateA = parseDate(a.session);
      const dateB = parseDate(b.session);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });

    const teacherName = `${user.nom || ''} ${user.prenom || ''}`.trim() || user.email || 'Teacher';
    const teacherGrade = typeof user.grade === 'string' ? user.grade : (user.grade?.intitule || user.grade?.name || 'N/A');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>Planning de surveillance</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 24px;
              color: #1a1a1a;
            }
            h1, h2, h3 {
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .tag {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            .tag-selected {
              background-color: #e8f5e9;
              color: #2e7d32;
            }
            .tag-subject {
              background-color: #ffebee;
              color: #c62828;
            }
            .tag-responsable {
              background-color: #ffebee;
              color: #c62828;
              font-weight: 700;
            }
            .header {
              border-bottom: 2px solid #1976d2;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .meta {
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Planning de surveillance</h1>
            <p class="meta"><strong>Enseignant :</strong> ${teacherName}</p>
            <p class="meta"><strong>Grade :</strong> ${teacherGrade}</p>
            <p class="meta"><strong>Email :</strong> ${user.email || 'N/A'}</p>
            <p class="meta"><strong>Date d'impression :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          <h2>Sessions selectionnees & matieres enseignees</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Salle(s)</th>
                <th>Matiere(s)</th>
                <th>Surveillants</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${printableEntries
        .map(({ session, tags }) => {
          const rooms = (session.salles || session.salle || [])
            .map((salle) => (typeof salle === 'string' ? salle : salle?.nom || ''))
            .filter(Boolean)
            .join(', ') || 'N/A';
          const subjects = tags.has('subject')
            ? (
              (session.matieres || [])
                .map((matiere) => (typeof matiere === 'string' ? matiere : matiere?.nom || ''))
                .filter(Boolean)
                .join(', ') || 'N/A'
            )
            : '—';
          const surveillants = (session.enseignants || session.surveillants || [])
            .map((ens) => `${ens.nom || ''} ${ens.prenom || ''}`.trim())
            .filter(Boolean)
            .join(', ') || 'N/A';

          const tagBadges = [
            tags.has('selected') ? '<span class="tag tag-selected">Choisie</span>' : '',
            tags.has('subject') ? '<span class="tag tag-responsable">RESPONSABLE</span>' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return `
                    <tr>
                      <td>${formatDate(session)}</td>
                      <td>${formatTime(session)}</td>
                      <td>${rooms}</td>
                      <td>${subjects}</td>
                      <td>${surveillants}</td>
                      <td>${tagBadges || '—'}</td>
                    </tr>
                  `;
        })
        .join('')}
            </tbody>
          </table>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      showSnackbar('Please allow pop-ups to print the schedule.', 'warning');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const requiredHours = calculateRequiredHours();
  const currentHours = calculateCurrentHours();
  // Normalize teacher subjects - handle both string and object formats
  const teacherSubjects = (user.matieres || []).map(m =>
    typeof m === 'string' ? { nom: m } : m
  );
  const selectedSessionIds = mySessions.map((s) => s.id);
  const subjectSessionIds = subjectSessions.map((s) => s.id);

  // Merge subject sessions with available sessions for the "Available Sessions" tab
  // Create a map to avoid duplicates
  const sessionMap = new Map();

  // Add all available sessions first
  availableSessions.forEach(session => {
    sessionMap.set(session.id, session);
  });

  // Add subject sessions (they will override if duplicate, which is fine)
  subjectSessions.forEach(session => {
    sessionMap.set(session.id, session);
  });

  // Create merged available sessions list
  const mergedAvailableSessions = Array.from(sessionMap.values());

  // Combine sessions for display
  const tabSessions = [mergedAvailableSessions, mySessions, subjectSessions];
  let allSessions = tabSessions[tabValue] || [];

  // Sort logic
  if (sortByAvailable && tabValue === 0) { // Only sort available sessions tab
    allSessions = [...allSessions].sort((a, b) => {
      // Check if session is available (not full and not already selected by the teacher)
      const aAvailable = (a.surveillants?.length || 0) < (a.maxSurveillants || 2) && 
                        !selectedSessionIds.includes(a.id);
      const bAvailable = (b.surveillants?.length || 0) < (b.maxSurveillants || 2) && 
                        !selectedSessionIds.includes(b.id);
      
      // If one is available and the other isn't, sort available first
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      
      // If both are available or both are not available, sort by date and time
      const dateA = a.date ? new Date(a.date + 'T' + (a.heureDebut || '00:00:00')) : new Date(0);
      const dateB = b.date ? new Date(b.date + 'T' + (b.heureDebut || '00:00:00')) : new Date(0);
      return dateA - dateB;
    });
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TeacherInfoHeader
        teacher={user}
        currentHours={currentHours}
        requiredHours={requiredHours}
        onLogout={handleLogout}
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 48,
              },
            }}
          >
            <Tab label="Available Sessions" />
            <Tab label="My Sessions" />
            <Tab label="Subject Sessions" />
          </Tabs>

          {/* Sort Toggle */}
          {tabValue === 0 && (
            <FormControlLabel
              control={
                <Switch
                  checked={sortByAvailable}
                  onChange={(e) => setSortByAvailable(e.target.checked)}
                  color="primary"
                />
              }
              label="Show Available First"
            />
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={autoAssigning ? <CircularProgress size={16} /> : <AutoAwesome />}
              onClick={handleAutoAssign}
              disabled={autoAssigning || currentHours >= requiredHours}
              sx={{ textTransform: 'none' }}
            >
              {autoAssigning ? 'Assigning...' : 'Assign Automatically'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Print />}
              onClick={handlePrintSchedule}
              disabled={currentHours < requiredHours || (mySessions.length === 0 && subjectSessions.length === 0)}
              sx={{ textTransform: 'none' }}
              title={currentHours < requiredHours ? 'You must complete your teaching charge before printing' : ''}
            >
              Imprimer le planning
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ScheduleGrid
            sessions={allSessions}
            teacherSubjects={teacherSubjects}
            selectedSessionIds={selectedSessionIds}
            subjectSessionIds={subjectSessionIds}
            onSessionClick={handleSessionClick}
            currentHours={currentHours}
            requiredHours={requiredHours}
          />
        )}

        {/* Pagination Control - Only show for Available Sessions tab */}
        {tabValue === 0 && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, session: null, action: null })}
      >
        <DialogTitle>
          {confirmDialog.action === 'select' ? 'Select Session' : 'Cancel Session'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'select'
              ? 'Are you sure you want to select this session?'
              : 'Are you sure you want to cancel this session?'}
          </DialogContentText>
          {confirmDialog.session && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Date:</strong> {confirmDialog.session.date || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Time:</strong> {confirmDialog.session.heureDebut?.substring(0, 5) || 'N/A'} - {confirmDialog.session.heureFin?.substring(0, 5) || 'N/A'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, session: null, action: null })}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} variant="contained" autoFocus>
            {confirmDialog.action === 'select' ? 'Select' : 'Cancel Session'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog for Incomplete Assignment */}
      <Dialog
        open={!loading && user && !user.fullCharge && currentHours < requiredHours && showWarning}
        onClose={() => setShowWarning(false)}
      >
        <DialogTitle sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="warning" /> Incomplete Assignment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Warning:</strong> You have not completed your teaching charge for the upcoming exams.
            <br /><br />
            Please select more sessions until your teaching charge is satisfied. You currently have <strong>{currentHours}h</strong> out of <strong>{requiredHours}h</strong> required.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)} color="primary" autoFocus>
            OK, I will select more
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
