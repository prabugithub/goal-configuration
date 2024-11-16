// src/components/GoalHierarchySelection/GoalHierarchySelection.js

import React, { useState } from 'react';
import { Checkbox, FormControlLabel, Typography, Button, Alert, List, ListItem } from '@mui/material';
import { useGoalConfig } from '../../context/GoalConfigContext';

const GoalHierarchySelection = ({onNext}) => {
    // Fixed Yearly level
    const yearly = true;

    // State for tracking selected breakdown levels
    const {levels, setLevels} = useGoalConfig();

    // State for validation message
    const [validationMessage, setValidationMessage] = useState('');

    // Toggle breakdown levels on and off
    const handleLevelChange = (level) => {
        setLevels((prevLevels) => ({
            ...prevLevels,
            [level]: !prevLevels[level]
        }));
        setValidationMessage('');
        console.log('Selected breakdown levels:', levels);
       
    };

    // Handle form submission or "Next" button click
    const handleSubmit = () => {
        const selectedLevels = Object.values(levels).filter((selected) => selected);

        if (selectedLevels.length === 0) {
            setValidationMessage('Please select at least one breakdown level (Quarterly, Monthly, Weekly, or Daily).');
        } else {
            setValidationMessage('');
            // Proceed to next step, save configuration, etc.
            console.log('Selected breakdown levels:', levels);
            onNext();
        }
    };
    return (
        <div>
            <Typography variant="h5">Goal Breakdown settings</Typography>

            <List sx={{ width: '100%', alignItems: "center", maxWidth: 360, bgcolor: 'background.paper' }}>
                <ListItem>
                    {/* Fixed Yearly Goal */}
                    <div style={{ marginBottom: '1rem' }}>
                        <FormControlLabel
                            control={<Checkbox checked={yearly} disabled />}
                            label="Yearly Goal (Fixed)"
                        />
                    </div>
                </ListItem>
                {Object.keys(levels).map((level) => (
                    <ListItem key={level}
                    >
                        <div  style={{ marginBottom: '1rem' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={levels[level]}
                                        onChange={() => handleLevelChange(level)}
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

            {/* Submit Button */}
            <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '1rem' }}>
                Save & Next
            </Button>
        </div>
    );
};

export default GoalHierarchySelection;
