import React, { useState } from 'react';
import {
    Typography,
    TextField,
    Button,
    Checkbox,
    RadioGroup,
    Radio,
    FormLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    List,
    ListItem,
    Box,
    Select,
    MenuItem,
    Tabs,
    Tab,
} from '@mui/material';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { saveUserConfig } from '../../api/services/firebaseServices';
import { useAuth } from '../../context/AuthContext';

const TrackYourGoal = () => {
    const { config } = useGoalConfig();
    const { user } = useAuth();

    const [formValues, setFormValues] = useState({});
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    const handleInputChange = (level, sectionName, fieldName, value) => {
        setFormValues((prev) => ({
            ...prev,
            [level]: {
                ...prev[level],
                [sectionName]: {
                    ...prev[level]?.[sectionName],
                    [fieldName]: value,
                },
            },
        }));
    };

    const handleSubmit = () => {
        console.log('Form Values:', formValues);
        saveUserConfig(formValues, user.uid);
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const renderField = (field, level, sectionName, index) => {
        const value =
            formValues[level]?.[sectionName]?.[field.label] || (field.type === 'checkbox' ? [] : '');

        switch (field.type) {
            case 'text':
                return (
                    <TextField
                        key={`${level}-${sectionName}-${index}`}
                        label={field.label}
                        size="small"
                        variant="standard"
                        value={value}
                        onChange={(e) =>
                            handleInputChange(level, sectionName, field.label, e.target.value)
                        }
                        sx={{ flex: 1 }}
                    />
                );

            case 'dropdown':
                return (
                    <Select
                        key={`${level}-${sectionName}-${index}`}
                        value={value}
                        onChange={(e) =>
                            handleInputChange(level, sectionName, field.label, e.target.value)
                        }
                        size="small"
                        sx={{ flex: 1 }}
                    >
                        {field.options.map((option, index) => (
                            <MenuItem value={option} key={`${field.label}-option-${index}`}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                );

            case 'checkbox':
                return (
                    <FormGroup key={`${level}-${sectionName}-${index}`} row>
                        {field.options.map((option, index) => (
                            <FormControlLabel
                                key={`${field.label}-checkbox-${index}`}
                                control={
                                    <Checkbox
                                        checked={value.includes(option)}
                                        onChange={(e) => {
                                            const newValue = e.target.checked
                                                ? [...value, option]
                                                : value.filter((v) => v !== option);
                                            handleInputChange(level, sectionName, field.label, newValue);
                                        }}
                                    />
                                }
                                label={option}
                            />
                        ))}
                    </FormGroup>
                );

            case 'radio':
                return (
                    <RadioGroup
                        key={`${level}-${sectionName}-${index}`}
                        row
                        value={value}
                        onChange={(e) =>
                            handleInputChange(level, sectionName, field.label, e.target.value)
                        }
                    >
                        {field.options.map((option, index) => (
                            <FormControlLabel
                                key={`${field.label}-radio-${index}`}
                                value={option}
                                control={<Radio />}
                                label={option}
                            />
                        ))}
                    </RadioGroup>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Selected Goal Levels
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Goal levels" key="levels_tab">
                    {Object.keys(config.levels)
                        .filter((level) => config.levels[level])
                        .map((level, index) => (
                            <Tab label={level} {...a11yProps(index)} key={'tab_' + index} />
                        ))}
                </Tabs>
            </Box>

            {Object.keys(config.levels)
                .filter((level) => config.levels[level])
                .map((level, index) => (
                    <div
                        key={`tabpanel-${level}-${index}`}
                        role="tabpanel"
                        hidden={tabIndex !== index}
                        id={`tabpanel-${index}`}
                    >
                        {tabIndex === index && (
                            <Box sx={{ p: 3 }}>
                                {config.sections[level].map((section) => (
                                    <Box key={`section-${level}-${section.name}`} sx={{ mt: 2 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontStyle: 'italic', fontWeight: 'bold' }}
                                        >
                                            {section.label || section.name}
                                        </Typography>

                                        <List>
                                            {section.fields.map((field, index) => (
                                                <ListItem
                                                    key={`field-${level}-${section.name}-${index}`}
                                                    sx={{ display: 'flex', flexDirection: 'column' }}
                                                >
                                                    {renderField(field, level, section.name, index)}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </div>
                ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Box>
        </div>
    );
};

export default TrackYourGoal;
