import { createContext, useContext, useState } from "react";


// Create context
const FieldConfigContext = createContext();


// Hook for consuming data
export const useFieldConfig = () => useContext(FieldConfigContext);


// Class creation for provider
export const FieldConfigProvider = ({ children }) => {

    const [fieldsSettings, setFields] = useState({
        evaluation: [
            { label: 'Happy', type: 'text' },
            { label: 'Stop', type: 'text' },
            { label: 'Start', type: 'text' },
            { label: 'Action', type: 'text' },
        ],
        planning: [
            { label: 'To-dos', type: 'text' },
            { label: 'One Thing', type: 'text' },
        ],
        taskSplitUp: {
            yearly: [
                { label: 'Quarter 1', type: 'text' },
                { label: 'Quarter 2', type: 'text' },
                { label: 'Quarter 3', type: 'text' },
                { label: 'Quarter 4', type: 'text' },
            ],
            quarterly: [
                { label: 'Month 1', type: 'text' },
                { label: 'Month 2', type: 'text' },
                { label: 'Month 3', type: 'text' },
            ],
            monthly: [
                { label: 'Week 1', type: 'text' },
                { label: 'Week 2', type: 'text' },
                { label: 'Week 3', type: 'text' },
                { label: 'Week 4', type: 'text' },
            ],
            weekly: [
                { label: 'Mon', type: 'text' },
                { label: 'Tue', type: 'text' },
                { label: 'Wed', type: 'text' },
                { label: 'Thu', type: 'text' },
                { label: 'Fri', type: 'text' },
                { label: 'Sat', type: 'text' },
                { label: 'Sun', type: 'text' },
            ],
        },
        dailyRituals: [
            { label: 'Meditation', type: 'checkbox', options: ['Yes', 'No'] },
            { label: 'Reading', type: 'checkbox', options: ['Yes', 'No'] },
            { label: 'Exercise', type: 'checkbox', options: ['Yes', 'No'] },
        ],
        dailyEvaluation: [
            { label: 'What went well in the past 24 hours?', type: 'text' },
            { label: 'What is the one thing I can do best tomorrow?', type: 'text' },
            { label: 'What is one thing I can improve?', type: 'text' },
        ],
    });

    return (
        <FieldConfigContext.Provider value={{ fieldsSettings, setFields }} key='FieldConfigProvider'>{children}</FieldConfigContext.Provider>
    )
}