// src/components/NextStep/NextStep.js

import React from 'react';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { Typography, List, ListItem } from '@mui/material';

const NextStep = () => {
    const { levels } = useGoalConfig();

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
        </div>
    );
};

export default NextStep;
