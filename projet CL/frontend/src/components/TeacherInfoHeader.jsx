import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  LinearProgress,
  Button,
  Chip,
} from '@mui/material';
import { Logout, Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../context/ThemeContext.jsx';
import { IconButton, Tooltip } from '@mui/material';

const TeacherInfoHeader = ({ teacher, currentHours, requiredHours, onLogout }) => {
  const theme = useTheme();
  const colorMode = useColorMode();

  const progress = requiredHours > 0 ? (currentHours / requiredHours) * 100 : 0;
  const remainingHours = Math.max(0, requiredHours - currentHours);
  const isFullCharge = currentHours >= requiredHours;

  return (
    <AppBar position="static" elevation={2} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar sx={{ flexWrap: 'wrap', gap: 2, py: 2 }}>
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
            {teacher?.prenom || ''} {teacher?.nom || ''}
            {!teacher?.prenom && !teacher?.nom && 'Teacher'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {teacher?.grade && (
              <Chip
                label={teacher.grade.nom || teacher.grade}
                size="small"
                sx={{ bgcolor: 'primary.light', color: '#ffffff' }}
              />
            )}
            {teacher?.matieres && teacher.matieres.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {teacher.matieres.map((m, index) => (
                  <Chip
                    key={index}
                    label={typeof m === 'string' ? m : m.nom}
                    size="small"
                    variant="outlined"
                    sx={{ color: 'text.secondary', borderColor: 'divider' }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, width: { xs: '100%', md: 'auto' }, maxWidth: { md: 400 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Teaching Charge
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentHours.toFixed(1)}h / {requiredHours.toFixed(1)}h
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, progress)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: isFullCharge ? 'success.main' : 'primary.main',
                borderRadius: 4,
              },
            }}
          />
          {remainingHours > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {remainingHours.toFixed(1)}h remaining
            </Typography>
          )}
          {isFullCharge && (
            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}>
              ✓ Full charge achieved
            </Typography>
          )}
        </Box>


        <Tooltip title={theme.palette.mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton sx={{ ml: 1, mr: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={onLogout}
          sx={{ minWidth: 120 }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default TeacherInfoHeader;

