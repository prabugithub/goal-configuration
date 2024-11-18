// src/context/StepContext.js

import React, { createContext, useContext, useState } from "react";

// Create context
const StepContext = createContext();

// Cstome hook to use Context
export const useStep = () => useContext(StepContext);


// Provider component
export const StepProvider = ({ children }) => {

    const [currentStep, setCurrentStep] = useState(0);

    const goNext = () => setCurrentStep((prev) => prev + 1);

    const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    return (
        <StepContext.Provider value={{ currentStep, goNext, goBack }}>
            {children}
        </StepContext.Provider>
    )

}
