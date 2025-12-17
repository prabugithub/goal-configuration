// src/App.js

import './App.css';
import { useEffect, useState } from 'react';
import { Container, CssBaseline, IconButton, Typography, Tabs, Tab, Box, useMediaQuery, useTheme, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import GoalHierarchySelection from './components/GoalHierarchySelection/GoalHierarchySelection';
import NextStep from './components/NextStep/NextStep';
import ConfigureFields from './components/ConfigureFields/ConfigureFields';
import Login from './components/Login/LoginPage';
import Signup from './components/Login/SignUp';
import AppGuide from './components/AppGuide/AppGuide';
import TrackYourGoal from './components/TrackYourGoal/TrackYourGoal';
import Dashboard from './components/Dashboard/Dashboard';
import GoalSearch from './components/GoalSearch/GoalSearch';
import WhatsAppShare from './components/ShareReport/WhatsAppShare';
import ReportGenerator from './components/ShareReport/ReportGenerator';
import MobileBottomNav, { MobileContentPadding } from './components/MobileBottomNav/MobileBottomNav';
import SmartGoalPrompt from './components/SmartGoalPrompt/SmartGoalPrompt';
import ExportButton from './components/ExportButton/ExportButton';
import { ToastProvider } from './context/ToastContext';
import { useGoals } from './hooks/useGoals';
import { useMetrics } from './hooks/useMetrics';

import { auth } from './api/firebase/firebas';
import { deleteUserConfiguration, getUserConfiguration, saveUserConfig } from './api/services/firebaseServices';
import { useGoalConfig } from './context/GoalConfigContext';
import { useStep } from './context/StepContext';
import { initialConfigState } from './context/DefaultValues/GlobalDefaultConfig';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentStep } = useStep();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(1);
  const [showDashboard, setShowDashboard] = useState(false);
  const [allGoals, setAllGoals] = useState({});
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteConfigDialogOpen, setDeleteConfigDialogOpen] = useState(false);

  const { config, setConfig, hasConfiguration, setHasConfiguration, doResetConfig, setDoResetConfig } = useGoalConfig();
  const { goals } = useGoals(user?.uid);
  const metrics = useMetrics(goals, config);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const conf = await getUserConfiguration(currentUser.uid);
          setConfig(conf);
          if (conf) {
            setHasConfiguration(true);
          } else if (!conf && !doResetConfig) {
            setLoading(true);
            setConfig(initialConfigState);
            await saveUserConfig(initialConfigState, currentUser.uid);
            setHasConfiguration(true);
            setLoading(false);
          } else {
            setHasConfiguration(false);
          }
        } catch (error) {
          console.error("Error checking user configuration:", error);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      setUser(null);
      setLogoutDialogOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleConfigDelete = async () => {
    if (user) {
      try {
        await deleteUserConfiguration(user.uid);
        setConfig(initialConfigState);
        setHasConfiguration(false);
        setDoResetConfig(true);
        setDeleteConfigDialogOpen(false);
        console.log("User configuration deleted successfully.");
      } catch (error) {
        console.error("Error deleting configuration:", error);
      }
    }
  };

  const steps = [
    <AppGuide key="step0" />,
    <GoalHierarchySelection key="step1" />,
    <ConfigureFields key="step2" />,
    <NextStep key="step3" />
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <ToastProvider>
      <div className="App">
        <CssBaseline />
        {user ? (
          <Container maxWidth="sm" className="container">
            <header className="app-header">
              <IconButton color="secondary" onClick={() => setDeleteConfigDialogOpen(true)} title="Delete Configuration">
                <SettingsIcon />
              </IconButton>
              <Typography variant="h5" color="primary" gutterBottom>
                {hasConfiguration ? "Your Onething!" : "Focus2Win!"}
              </Typography>
              <IconButton color="primary" onClick={() => setLogoutDialogOpen(true)} title="Logout">
                <LogoutIcon />
              </IconButton>
            </header>

            {/* Menu Tabs */}
            {hasConfiguration && (
              <>
                {/* Smart Goal Prompt */}
                <SmartGoalPrompt
                  goals={goals}
                  config={config}
                  onSelectLevel={(level) => {
                    // Handle level selection
                    console.log('Selected level:', level);
                  }}
                />

                {/* Top Navigation for Desktop, Bottom Nav for Mobile */}
                {!isMobile && (
                  <Tabs value={tabIndex} onChange={(e, newVal) => setTabIndex(newVal)} centered sx={{ mb: 2 }}>
                    <Tab label="📊 Dashboard" />
                    <Tab label="📝 Goal Entry" />
                  </Tabs>
                )}

                <MobileContentPadding>
                  {/* Dashboard Tab */}
                  {((tabIndex === 0 && !isMobile) || (isMobile && showDashboard)) && (
                    <TabPanel value={tabIndex} index={0}>
                      {/* Quick Actions - Compact Icon Bar */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          justifyContent: 'flex-end',
                          mb: 1,
                          '& > *': {
                            transform: 'scale(0.9)',
                          },
                        }}
                      >
                        <WhatsAppShare goals={goals} config={config} metrics={metrics} />
                        <ReportGenerator goals={goals} config={config} metrics={metrics} userId={user?.uid} />
                        <ExportButton goals={goals} config={config} userId={user?.uid} />
                      </Stack>

                      {/* Main Dashboard */}
                      <Dashboard goals={goals} config={config} />
                    </TabPanel>
                  )}

                  {/* Goal Entry Tab */}
                  {((tabIndex === 1 && !isMobile) || (isMobile && !showDashboard)) && (
                    <TabPanel value={tabIndex} index={1}>
                      <TrackYourGoal />
                    </TabPanel>
                  )}

                  {/* Analytics Tab - Hidden */}
                  {/* {(tabIndex === 2 || (!isMobile && !showDashboard)) && (
                    <TabPanel value={tabIndex} index={2}>
                      <Box sx={{ mb: 3 }}>
                        <AnalyticsCharts metrics={metrics} goals={goals} />
                      </Box>
                    </TabPanel>
                  )} */}

                  {/* Reports Tab - Removed (functionality integrated into Dashboard Quick Actions) */}
                </MobileContentPadding>

                {/* Mobile Bottom Navigation */}
                {isMobile && (
                  <MobileBottomNav
                    levels={Object.keys(config.levels || {}).filter(level => config.levels[level])}
                    selectedLevel={tabIndex}
                    onLevelChange={setTabIndex}
                    showDashboard={showDashboard}
                    onDashboardToggle={setShowDashboard}
                  />
                )}
              </>
            )}

            {!hasConfiguration && steps[currentStep]}

            {/* Logout Confirmation Dialog */}
            <Dialog
              open={logoutDialogOpen}
              onClose={() => setLogoutDialogOpen(false)}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to log out?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleLogout} color="error" variant="contained">
                  Logout
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Configuration Confirmation Dialog */}
            <Dialog
              open={deleteConfigDialogOpen}
              onClose={() => setDeleteConfigDialogOpen(false)}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>Delete Configuration</DialogTitle>
              <DialogContent>
                <Typography>
                  This will delete your goal configuration. Are you sure?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteConfigDialogOpen(false)} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleConfigDelete} color="error" variant="contained">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        ) : (
          <Login key="login" />
        )}
      </div>
    </ToastProvider>
  );
}

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default App;
