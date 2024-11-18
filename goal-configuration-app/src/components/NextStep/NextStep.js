// src/components/NextStep/NextStep.js

import React from 'react';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { Typography, List, ListItem, Box, Button } from '@mui/material';
import { useStep } from '../../context/StepContext';

const NextStep = () => {
    const { levels } = useGoalConfig();
    const { goBack } = useStep();

    const selectedLevels = Object.keys(levels).filter((level) => levels[level]);

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Selected Goal Levels
            </Typography>
            <List>
                {selectedLevels.length > 0 ? (
                    selectedLevels.map((level) => (
                        <ListItem key={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</ListItem>
                    ))
                ) : (
                    <Typography>No levels selected</Typography>
                )}
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }}>
                {/* Back Button */}
                <Button variant="contained" color="secondary" onClick={goBack}>
                    Back
                </Button>

                {/* Next Button (disabled for demonstration) */}
                <Button variant="contained" color="primary" disabled>
                    Next
                </Button>
            </Box>
        </div>
    );
};

export default NextStep;
