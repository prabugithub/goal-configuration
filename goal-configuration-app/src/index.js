import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { GoalConfigProvider } from './context/GoalConfigContext';
import { StepProvider } from './context/StepContext';
import { FieldConfigProvider } from './context/FildConfigContext';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider key="authenticate">
    <ThemeProvider theme={theme} key='theme_provider'>
      <StepProvider key='step_provider'>
        <GoalConfigProvider key='goal_provider'>
          <FieldConfigProvider key='field_provider'>
            <App key='app_tag'/>
          </FieldConfigProvider>
        </GoalConfigProvider>
      </StepProvider>
    </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
