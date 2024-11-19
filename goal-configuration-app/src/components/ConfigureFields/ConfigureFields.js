import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Paper,
  Box,
} from '@mui/material';
import { useGoalConfig } from '../../context/GoalConfigContext';

const ConfigureFields = () => {
  const { levels } = useGoalConfig(); // Get hierarchy configuration from context

  // Default sections for each level
  const defaultSections = {
    evaluation: ['Happy', 'Stop', 'Start', 'Action'],
    planning: ['To-dos', 'One Thing'],
    taskSplitUp: {
      yearly: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
      quarterly: ['Month 1', 'Month 2', 'Month 3'],
      monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    dailyRituals: ['Meditation', 'Reading', 'Exercise'],
    dailyEvaluation: [
      'What went well in the past 24 hours?',
      'What is the one thing I can do best tomorrow?',
      'What is one thing I can improve?',
    ],
  };

  // Track enabled/disabled sections for each level
  const [sections, setSections] = useState(
    Object.keys(levels).reduce((acc, level) => {
      acc[level] = { ...defaultSections }; // Initialize with default sections
      return acc;
    }, {})
  );

  // Track custom fields for each level
  const [customFields, setCustomFields] = useState(
    Object.keys(levels).reduce((acc, level) => {
      acc[level] = []; // Start with no custom fields
      return acc;
    }, {})
  );

  // Toggle section enable/disable for a level
  const toggleSection = (level, section) => {
    setSections((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [section]: !prev[level][section],
      },
    }));
  };

  // Add custom field to a specific level
  const addCustomField = (level) => {
    const label = prompt(`Enter custom field label for ${level}`);
    const type = prompt(`Enter field type (text, checkbox, radio, dropdown)`);
    const options =
      type === 'checkbox' || type === 'radio' || type === 'dropdown'
        ? prompt('Enter options (comma-separated)').split(',')
        : [];
    if (label && type) {
      setCustomFields((prev) => ({
        ...prev,
        [level]: [...prev[level], { label, type, options }],
      }));
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Configure Sections and Fields
      </Typography>

      {/* Loop through each level */}
      {Object.keys(levels)
        .filter((level) => levels[level]) // Only display selected levels
        .map((level) => (
          <Paper key={level} elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">{`${level.charAt(0).toUpperCase() + level.slice(1)} Level`}</Typography>

            {/* Loop through default sections */}
            {Object.keys(defaultSections).map((section) => (
              <Box key={section} sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sections[level][section]}
                      onChange={() => toggleSection(level, section)}
                    />
                  }
                  label={section.charAt(0).toUpperCase() + section.slice(1)}
                />
                {sections[level][section] && (
                  <>
                    {/* Display default fields for the section */}
                    <List>
                      {(Array.isArray(defaultSections[section])
                        ? defaultSections[section]
                        : defaultSections.taskSplitUp[level]
                      ).map((item, index) => (
                        <ListItem key={index}>{item}</ListItem>
                      ))}
                    </List>

                    {/* Custom fields for this section */}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Custom Fields:
                    </Typography>
                    <List>
                      {customFields[level].map((field, index) => (
                        <ListItem key={index}>{field.label}</ListItem>
                      ))}
                      <ListItem>
                        <Button
                          variant="outlined"
                          onClick={() => addCustomField(level)}
                        >
                          Add Custom Field
                        </Button>
                      </ListItem>
                    </List>
                  </>
                )}
              </Box>
            ))}
          </Paper>
        ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="contained" color="secondary">
          Back
        </Button>
        <Button variant="contained" color="primary">
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default ConfigureFields;
