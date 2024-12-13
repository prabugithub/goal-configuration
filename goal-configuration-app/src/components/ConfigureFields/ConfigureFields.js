import React, { useState, useRef } from 'react';
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
  Tabs,
  Tab,
} from '@mui/material';
//import { Add, Delete } from '@mui/icons-material';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { useStep } from '../../context/StepContext';
import { useFieldConfig } from '../../context/FildConfigContext';

const ConfigureFields = () => {

  // State for tracking selected breakdown levels
  const { config, toggleSection, updateField, updateFieldOptions, addSection, addField } = useGoalConfig();
  const { goNext, goBack } = useStep();

  const inputRefs = useRef([]);

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

   const handleInputChange = (level, name, index, type, e) => {
   // const updatedFields = [...formFields];
  //  updatedFields[index].label = value;
    //setFormFields(updatedFields);
    updateField(level, name, index, type, e.target.value)

    setTimeout(() => inputRefs.current[name+index]?.focus(), 0); // Restore focus
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log('Sections:', config.sections);

    goNext();
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Configure Sections and Fields
      </Typography>

      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="Yearly selection">
            {Object.keys(config.levels)
              .filter((level) => config.levels[level]) // Only display selected levels
              .map((level, ind) => (
                <Tab label={level} {...a11yProps(ind)}  key={'tab_' + ind}/>
              ))}
          </Tabs>
        </Box>
        {/* Loop through each level */}
        {Object.keys(config.levels)
          .filter((level) => config.levels[level]) // Only display selected levels
          .map((level, ind) => (
            <CustomTabPanel value={value} index={ind} key={'customPanel_'+ind}>
              <Paper key={level} elevation={3} sx={{ p: 3, mb: 3 }}>

                <Typography variant="h6">{`${level.charAt(0).toUpperCase() + level.slice(1)} Level`}</Typography>

                {/* Loop through default sections */}
                {(config.sections[level]).map((section) => (
                  <Box key={section.name} sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={section?.enabled}
                          onChange={() =>
                            toggleSection(level, section.name)
                          }
                        />
                      }
                      label={section?.label || section?.name.charAt(0).toUpperCase() + section?.name.slice(1)}
                    />
                    {section && (
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Fields:
                        </Typography>
                        <List>
                          {section?.fields?.map((field, index) => (
                            <ListItem key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                  label="Field Label"
                                  size="small"
                                  value={field.label}
                                  inputRef={(el) => (inputRefs.current[section.name+index] = el)}
                                  onChange={(e) => handleInputChange(level, section.name, index, 'label', e)
                                  }
                                  sx={{ flex: 1 }}
                                />
                                <Select
                                  value={field.type}
                                  onChange={(e) =>
                                    updateField(level, section.name, index, 'type', e.target.value)
                                  }
                                  size="small"
                                  sx={{ flex: 1 }}
                                >
                                  <MenuItem value="text">Text</MenuItem>
                                  <MenuItem value="checkbox">Checkbox</MenuItem>
                                  <MenuItem value="radio">Radio</MenuItem>
                                  <MenuItem value="dropdown">Dropdown</MenuItem>
                                </Select>
                              </Box>
                              {/* Render options for checkbox, radio, dropdown */}
                              {['checkbox', 'radio', 'dropdown'].includes(field.type) && (
                                <Box>
                                  <Typography variant="body2">Options:</Typography>
                                  <List>
                                    {field.options?.map((opt, i) => (
                                      <ListItem key={i} sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                          value={opt}
                                          size="small"
                                          onChange={(e) => {
                                            const newOptions = [...field.options];
                                            newOptions[i] = e.target.value;
                                            updateFieldOptions(level, section.name, index, newOptions);
                                          }}
                                        />
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            const newOptions = field.options.filter((_, idx) => idx !== i);
                                            updateFieldOptions(level, section.name, index, newOptions);
                                          }}
                                        >
                                          {/* <Delete fontSize="small" /> */}
                                        </IconButton>
                                      </ListItem>
                                    ))}
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        updateFieldOptions(level, section.name, index, [
                                          ...(field.options || []),
                                          '',
                                        ])
                                      }
                                    >
                                      Add Option
                                    </Button>
                                  </List>
                                </Box>
                              )}
                            </ListItem>
                          ))}
                          <ListItem>
                            <Button
                              variant="outlined"
                              onClick={() => addField(level, section.name, { label: ' ', type: 'text', options: [] })}
                            >
                              Add More
                            </Button>
                          </ListItem>
                        </List>
                      </>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={() => addSection(level, `custom${config.sections[level].length + 1}`, prompt("Enter section name"))}
                >
                  Add Section
                </Button>
              </Paper>
            </CustomTabPanel>

          ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 3 }}>
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
