// src/App.js

import React from 'react';
import './App.css';
import GoalHierarchySelection from './components/GoalHierarchySelection/GoalHierarchySelection';

function App() {
  return (
    <div className="App">
      <h1>Goal Configuration</h1>
      <GoalHierarchySelection />
    </div>
  );
}

export default App;
