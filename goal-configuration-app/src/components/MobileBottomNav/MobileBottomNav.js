import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/**
 * MobileBottomNav - Mobile-optimized bottom navigation
 * Shows Dashboard and Goal Entry navigation on mobile
 * Responsive: Bottom nav on mobile, top tabs on desktop
 */
export const MobileBottomNav = ({
  levels = [],
  selectedLevel = 0,
  onLevelChange,
  showDashboard = false,
  onDashboardToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) {
    return null; // Only show on mobile
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={showDashboard ? 0 : 1}
        onChange={(event, newValue) => {
          if (newValue === 0) {
            onDashboardToggle(true);
          } else if (newValue === 1) {
            onDashboardToggle(false);
          }
        }}
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          height: 'auto',
          py: 0.5,
        }}
      >
        {/* Dashboard View */}
        <BottomNavigationAction
          label="Dashboard"
          icon={<BarChartIcon />}
          value={0}
          sx={{
            minWidth: '60px',
            py: 1,
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
            },
          }}
        />

        {/* Goal Entry View */}
        <BottomNavigationAction
          label="Goal Entry"
          icon={<EditNoteIcon />}
          value={1}
          sx={{
            minWidth: '60px',
            py: 1,
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

/**
 * MobileContentPadding - Padding component to prevent content from being hidden under bottom nav
 * Use this as a wrapper around main content on mobile
 */
export const MobileContentPadding = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ pb: isMobile ? '70px' : 0 }}>
      {children}
    </Box>
  );
};

export default MobileBottomNav;
