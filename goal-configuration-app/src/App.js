// src/App.js

import React, { useState } from 'react';
import './App.css';
import GoalHierarchySelection from './components/GoalHierarchySelection/GoalHierarchySelection';
import { Container, CssBaseline } from '@mui/material';
import NextStep from './components/NextStep/NextStep';

function App() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(2); // Navigate to the next step
  };
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="sm">
        <h1>Focus2Win!</h1>
        {currentStep === 1 && <GoalHierarchySelection onNext={handleNext} />}
        {currentStep === 2 && <NextStep />}
      </Container>
    </div>
  );
}

export default App;
