// src/context/GoalConfigContext.js

import React, { createContext, useContext, useState } from 'react';
import {initialConfigState} from './DefaultValues/GlobalDefaultConfig';


// Default settings



// Create Context
const GoalConfigContext = createContext();

// Custom hook for consuming the context
export const useGoalConfig = () => useContext(GoalConfigContext);

// Provider Component
export const GoalConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(initialConfigState);

    const [hasConfiguration, setHasConfiguration] = useState(false);

    const [doResetConfig, setDoResetConfig] = useState(false);
    

    // toggle the hierarchy selection of the evaluation duration
    const toggleLevels = (level) => {
        setConfig((conf) => ({
            ...config,
            levels: {
                ...conf.levels,
                [level]: !conf.levels[level]
            }
        }))
    };

    // Toggle a section
    const toggleSection = (level, sectionName) => {
        setConfig((prev) => ({
            ...prev,
            sections: {
                ...prev.sections,
                [level]: prev.sections[level].map((section) =>
                    section.name === sectionName
                        ? { ...section, enabled: !section.enabled }
                        : section
                ),
            },
        }));
    };

    // Update a field
    const updateField = (level, sectionName, index, key, value) => {
        setConfig((prev) => ({
            ...prev,
            sections: {
                ...prev.sections,
                [level]: prev.sections[level].map((section) =>
                    section.name === sectionName
                        ? {
                            ...section,
                            fields: section.fields.map((field, i) =>
                                i === index ? { ...field, [key]: value } : field
                            ),
                        }
                        : section
                ),
            },
        }));
    };

     // Add or edit options for a field
  const updateFieldOptions = (level, sectionName, index, options) => {
    setConfig((prev) => ({
        ...prev,
        sections: {
            ...prev.sections,
            [level]: prev.sections[level].map((section) =>
                section.name === sectionName
                    ? {
                        ...section,
                        fields: section.fields.map((field, i) =>
                            i === index ? { ...field, options } : field
                        ),
                    }
                    : section
            ),
        },
    }));
  };

    // Add a custom section
    const addSection = (level, sectionName, label = sectionName) => {
        setConfig((prev) => ({
            ...prev,
            sections: {
                ...prev.sections,
                [level]: [
                    ...prev.sections[level],
                    { name: sectionName, label: label, enabled: true, fields: [] },
                ],
            },
        }));
    };

    // Add a custom field
    const addField = (level, sectionName, field) => {
        setConfig((prev) => ({
            ...prev,
            sections: {
                ...prev.sections,
                [level]: prev.sections[level].map((section) =>
                    section.name === sectionName
                        ? { ...section, fields: [...section.fields, field] }
                        : section
                ),
            },
        }));
    };

    return (
        <GoalConfigContext.Provider value={{ config, setConfig, hasConfiguration, doResetConfig, setDoResetConfig, setHasConfiguration, toggleLevels, toggleSection, updateField, addSection, addField, updateFieldOptions }}>
            {children}
        </GoalConfigContext.Provider>
    );
};
