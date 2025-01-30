// src/App.js

import './App.css';
import GoalHierarchySelection from './components/GoalHierarchySelection/GoalHierarchySelection';
import { Button, Container, CssBaseline, IconButton, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout'; // Import Logout icon
import NextStep from './components/NextStep/NextStep';
import { useStep } from './context/StepContext';
import ConfigureFields from './components/ConfigureFields/ConfigureFields';
import Login from './components/Login/LoginPage';
import Signup from './components/Login/SignUp';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './api/firebase/firebas';
import { getUserConfiguration } from './api/services/firebaseServices';
import TrackYourGoal from './components/TrackYourGoal/TrackYourGoal';
import { useGoalConfig } from './context/GoalConfigContext';
import { initialConfigState } from './context/DefaultValues/GlobalDefaultConfig';
import AppGuide from './components/AppGuide/AppGuide';

function App() {
  const { currentStep } = useStep();
  const [user, setUser] = useState(null);
  const [hasConfiguration, setHasConfiguration] = useState(false);
  const { config, setConfig } = useGoalConfig();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if the user has a configuration
          const conf = await getUserConfiguration(currentUser.uid);
          setConfig(conf);
          // Set true if configuration exists
          if (conf) {
            setHasConfiguration(true);
          } else {
            setConfig(initialConfigState)
          }
        } catch (error) {
          console.error("Error checking user configuration:", error);
        }
      }
      setLoading(false); // Stop loading once auth and config check is complete
    });

    // Log out on app close or refresh
    const handleLogoutOnClose = () => {
      signOut(auth)
        .then(() => console.log("User logged out on app close"))
        .catch((error) => console.error("Error during logout on close:", error));
    };

    window.addEventListener("beforeunload", handleLogoutOnClose);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleLogoutOnClose);
    };
  }, []);

   // Logout function
   const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Array of step components
  const steps = [
    <AppGuide key="step0" />,
    <GoalHierarchySelection key="step1" />,
    <ConfigureFields key="step2" />,
    <NextStep key="step3" />,
  ];

  if (loading) {
    return <div>Loading...</div>; // Display a loading spinner or message
  }

  return (
    <div className="App">
      <CssBaseline />
      {user ? (
         <Container maxWidth="sm">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <Typography variant="h5" color="primary" gutterBottom>
             {hasConfiguration ? "Your Onething!" : "Focus2Win!"}
           </Typography>
           <IconButton color="primary" onClick={handleLogout} title="Logout">
           <LogoutIcon />
           </IconButton>
         </div>
         {hasConfiguration ? <TrackYourGoal /> : steps[currentStep]}
       </Container>
      ) : (
        <div>
          <Login key="login" />
        </div>
      )}
    </div>
  );
}

export default App;
