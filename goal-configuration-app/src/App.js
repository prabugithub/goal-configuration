// src/App.js

import './App.css';
import GoalHierarchySelection from './components/GoalHierarchySelection/GoalHierarchySelection';
import { Container, CssBaseline } from '@mui/material';
import NextStep from './components/NextStep/NextStep';
import { useStep } from './context/StepContext';
import ConfigureFields from './components/ConfigureFields/ConfigureFields';

function App() {
  // const [currentStep, setCurrentStep] = useState(1);

  // const handleNext = () => {
  //   setCurrentStep(2); // Navigate to the next step
  // };

  const { currentStep } = useStep();

  // Array of step components
  const steps = [
    <GoalHierarchySelection key="step1" />,
    <ConfigureFields key="step2"/>,
    <NextStep key="step3" />,
  ];

  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="sm">
        <h1>Focus2Win!</h1>
        {steps[currentStep]}
      </Container>
    </div>
  );
}

export default App;
