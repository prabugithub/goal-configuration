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
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { useStep } from '../../context/StepContext';

const ConfigureFields = () => {
  const { levels } = useGoalConfig(); // Get hierarchy configuration from context
  const { goNext, goBack } = useStep();

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

  // State for managing sections (default and custom)
  const [sections, setSections] = useState(
    Object.keys(levels).reduce((acc, level) => {
      acc[level] = { ...defaultSections, customSections: [] }; // Add customSections array
      return acc;
    }, {})
  );

  // State for managing fields in sections (default and custom)
  const [customFields, setCustomFields] = useState(
    Object.keys(levels).reduce((acc, level) => {
      acc[level] = { customSections: {} }; // Initialize customSections separately
      return acc;
    }, {})
  );

  // Temporary state for adding a new custom field
  const [newField, setNewField] = useState({
    level: null,
    section: null,
    label: '',
    type: 'text',
    options: [],
  });

  // Start adding a new custom field
  const startAddingField = (level, section) => {
    setNewField({ level, section, label: '', type: 'text', options: [] });
  };

  // Save the new custom field
  const saveField = () => {
    const { level, section, label, type, options } = newField;
    if (label.trim() === '') {
      alert('Field label cannot be empty.');
      return;
    }

    setCustomFields((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [section]: [
          ...(prev[level][section] || []),
          { label, type, options },
        ],
      },
    }));

    // Reset the newField state
    setNewField({ level: null, section: null, label: '', type: 'text', options: [] });
  };

  // Add option to the new custom field
  const addOption = () => {
    const option = prompt('Enter option value:');
    if (option) {
      setNewField((prev) => ({
        ...prev,
        options: [...prev.options, option],
      }));
    }
  };

  // Delete an option from the new custom field
  const deleteOption = (index) => {
    setNewField((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log('Sections:', sections);
    console.log('Custom Fields:', customFields);
    goNext();
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
                      onChange={() =>
                        setSections((prev) => ({
                          ...prev,
                          [level]: {
                            ...prev[level],
                            [section]: !prev[level][section],
                          },
                        }))
                      }
                    />
                  }
                  label={section.charAt(0).toUpperCase() + section.slice(1)}
                />
                {sections[level][section] && (
                  <>
                    <List>
                      {customFields[level][section]?.map((field, index) => (
                        <ListItem key={index}>
                          {field.label} ({field.type})
                        </ListItem>
                      ))}
                      <ListItem>
                        {newField.level === level &&
                        newField.section === section ? (
                          <Box>
                            <TextField
                              label="Field Label"
                              size="small"
                              value={newField.label}
                              onChange={(e) =>
                                setNewField((prev) => ({
                                  ...prev,
                                  label: e.target.value,
                                }))
                              }
                              sx={{ mr: 1 }}
                            />
                            <Select
                              value={newField.type}
                              onChange={(e) =>
                                setNewField((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }))
                              }
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <MenuItem value="text">Text</MenuItem>
                              <MenuItem value="checkbox">Checkbox</MenuItem>
                              <MenuItem value="radio">Radio</MenuItem>
                              <MenuItem value="dropdown">Dropdown</MenuItem>
                            </Select>
                            {['checkbox', 'radio', 'dropdown'].includes(
                              newField.type
                            ) && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  Options:
                                </Typography>
                                {newField.options.map((opt, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ mr: 1 }}
                                    >
                                      {opt}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() => deleteOption(i)}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ))}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={addOption}
                                  sx={{ mt: 1 }}
                                >
                                  Add Option
                                </Button>
                              </Box>
                            )}
                            <Box sx={{ mt: 2 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={saveField}
                                sx={{ mr: 1 }}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() =>
                                  setNewField({
                                    level: null,
                                    section: null,
                                    label: '',
                                    type: 'text',
                                    options: [],
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => startAddingField(level, section)}
                          >
                            Add Custom Field
                          </Button>
                        )}
                      </ListItem>
                    </List>
                  </>
                )}
              </Box>
            ))}
          </Paper>
        ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="contained" color="secondary" onClick={goBack}>
          Back
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default ConfigureFields;
