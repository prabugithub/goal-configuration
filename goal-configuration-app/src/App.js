// src/App.js

import './App.css';
import GoalHierarchySelection from './components/GoalHierarchySelection/GoalHierarchySelection';
import { Container, CssBaseline } from '@mui/material';
import NextStep from './components/NextStep/NextStep';
import { useStep } from './context/StepContext';
import ConfigureFields from './components/ConfigureFields/ConfigureFields';
import Login from './components/Login/LoginPage';
import Signup from './components/Login/SignUp';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './api/firebase/firebas';

function App() {
  // const [currentStep, setCurrentStep] = useState(1);

  // const handleNext = () => {
  //   setCurrentStep(2); // Navigate to the next step
  // };

  const { currentStep } = useStep();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Array of step components
  const steps = [
    <GoalHierarchySelection key="step1" />,
    <ConfigureFields key="step2"/>,
    <NextStep key="step3" />,
  ];

  return (
    <div className="App">
      <CssBaseline />
      {user? <Container maxWidth="sm">
        <h1>Focus2Win!</h1>
        {steps[currentStep]}
      </Container>: <>
      <Login key={'login'}/>
      <Signup key="signup"/>
      </>}
      
    </div>
  );
}

export default App;
