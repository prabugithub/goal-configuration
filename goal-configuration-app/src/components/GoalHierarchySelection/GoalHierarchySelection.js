// src/components/GoalHierarchySelection/GoalHierarchySelection.js

import React, { useState } from 'react';
import { Checkbox, FormControlLabel, Typography, Button, Alert, List, ListItem, Box } from '@mui/material';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { useStep } from '../../context/StepContext';

const GoalHierarchySelection = ({ onNext }) => {

    // State for tracking selected breakdown levels
    const { config, toggleLevels } = useGoalConfig();

    // hook for next step
    const { goNext } = useStep(); // Get navigation methods

    // State for validation message
    const [validationMessage, setValidationMessage] = useState('');

    // Toggle breakdown levels on and off
    // const handleLevelChange = (level) => {
    //     toggleLevels((prevLevels) => ({
    //         ...prevLevels,
    //         [level]: !prevLevels[level]
    //     }));
    //     setValidationMessage('');
    //     console.log('Selected breakdown levels:', levels);

    // };

    // Handle form submission or "Next" button click
    const handleSubmit = () => {
        const selectedLevels = Object.values(config.levels).filter((selected) => selected);

        if (selectedLevels.length === 0) {
            setValidationMessage('Please select at least one breakdown level (Quarterly, Monthly, Weekly, or Daily).');
        } else {
           // setValidationMessage('');
            // Proceed to next step, save configuration, etc.
            console.log('Selected breakdown levels:', config.levels);
            goNext();
        }
    };
    return (
        <div>
            <Typography variant="h5">Goal Breakdown settings</Typography>

            <List sx={{ width: '100%', alignItems: "center", maxWidth: 360, bgcolor: 'background.paper' }}>
                {Object.keys(config.levels).map((level) => (
                    <ListItem key={level}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={config.levels[level]}
                                        onChange={() => toggleLevels(level)}
                                    />
                                }
                                label={`${level.charAt(0).toUpperCase() + level.slice(1)} Breakdown`}
                            />
                        </div>
                    </ListItem>

                ))}
            </List>
            {/* Selectable Breakdown Levels */}
            {/* {Object.keys(levels).map((level) => (
                
            ))} */}

            {/* Validation Message */}
            {validationMessage && <Alert severity="warning">{validationMessage}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }}>
                {/* Back Button (disabled since it's the first step) */}
                <Button variant="contained" color="secondary" disabled>
                    Back
                </Button>

                {/* Submit Button */}
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Save & Next
                </Button>
            </Box>

        </div>
    );
};

export default GoalHierarchySelection;
