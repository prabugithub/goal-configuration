// src/App.js

import './App.css';
import { useEffect, useState } from 'react';
import { Container, CssBaseline, IconButton, Typography, Tabs, Tab, Box } from '@mui/material';
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
import ProgressDashboard from './components/ProgressDashboard/ProgressDashboard';

import { auth } from './api/firebase/firebas';
import { deleteUserConfiguration, getUserConfiguration, saveUserConfig } from './api/services/firebaseServices';
import { useGoalConfig } from './context/GoalConfigContext';
import { useStep } from './context/StepContext';
import { initialConfigState } from './context/DefaultValues/GlobalDefaultConfig';

function App() {
  const { currentStep } = useStep();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const { config, setConfig, hasConfiguration, setHasConfiguration, doResetConfig, setDoResetConfig } = useGoalConfig();

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
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (!isConfirmed) return;

    try {
      await signOut(auth);
      console.log("User logged out successfully");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleConfigDelete = async () => {
    const isConfirmed = window.confirm("This will delete your goal configuration. Are you sure?");
    if (!isConfirmed) return;

    if (user) {
      try {
        await deleteUserConfiguration(user.uid);
        setConfig(initialConfigState);
        setHasConfiguration(false);
        setDoResetConfig(true);
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
    <div className="App">
      <CssBaseline />
      {user ? (
        <Container maxWidth="sm" className="container">
          <header className="app-header">
            <IconButton color="secondary" onClick={handleConfigDelete} title="Delete Configuration">
              <SettingsIcon />
            </IconButton>
            <Typography variant="h5" color="primary" gutterBottom>
              {hasConfiguration ? "Your Onething!" : "Focus2Win!"}
            </Typography>
            <IconButton color="primary" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </IconButton>
          </header>

          {/* Menu Tabs */}
          {hasConfiguration && (
            <>
              <Tabs value={tabIndex} onChange={(e, newVal) => setTabIndex(newVal)} centered>
                <Tab label="Goal Entry" />
                <Tab label="Progress" />
              </Tabs>
              <TabPanel value={tabIndex} index={0}>
                <TrackYourGoal />
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                <ProgressDashboard userId={user?.uid} view="monthly" />
              </TabPanel>
            </>
          )}

          {!hasConfiguration && steps[currentStep]}
        </Container>
      ) : (
        <Login key="login" />
      )}
    </div>
  );
}

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default App;
