// src/context/GoalConfigContext.js

import React, { createContext, useContext, useState } from 'react';

// Create Context
const GoalConfigContext = createContext();

// Custom hook for consuming the context
export const useGoalConfig = () => useContext(GoalConfigContext);

// Provider Component
export const GoalConfigProvider = ({ children }) => {
    const [levels, setLevels] = useState({
        quarterly: false,
        monthly: false,
        weekly: false,
        daily: false,
    });

    return (
        <GoalConfigContext.Provider value={{ levels, setLevels }}>
            {children}
        </GoalConfigContext.Provider>
    );
};
