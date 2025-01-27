// src/components/NextStep/NextStep.js
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
    Paper,
    Box,
    Select,
    MenuItem,
    IconButton,
    Tabs,
    Tab,
} from '@mui/material';
// import { Add, Delete } from '@mui/icons-material';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { useStep } from '../../context/StepContext';
import { useFieldConfig } from '../../context/FildConfigContext';
import { saveUserConfig } from '../../api/services/firebaseServices';
import { auth } from '../../api/firebase/firebas';
import { useAuth } from '../../context/AuthContext';

const NextStep = () => {
    const { config, setConfig, toggleSection, updateField, updateFieldOptions, addSection, addField } = useGoalConfig();
    const { goNext, goBack } = useStep();

    const {user} = useAuth();

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Handle form submission
    const handleSubmit = async () => {
        console.log('Sections:', config.sections);

        await saveUserConfig(config, user.uid);
        alert('Configuration saved successfully!');
        window.location.reload();
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

    const selectedLevels = Object.keys(config.levels).filter((level) => config.levels[level]);

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Selected Goal Levels
            </Typography>
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="Yearly selection" key="levels_tab">
                        {Object.keys(config.levels)
                            .filter((level) => config.levels[level]) // Only display selected levels
                            .map((level, ind) => (
                                <Tab label={level} {...a11yProps(ind)} key={'tab_' + ind} />
                            ))}
                    </Tabs>
                </Box>
                {/* Loop through each level */}
                {Object.keys(config.levels)
                    .filter((level) => config.levels[level]) // Only display selected levels
                    .map((level, ind) => (
                        <CustomTabPanel value={value} index={ind} key={'custom_panel_' + ind}>
                            {/* <Paper key={level} elevation={3} sx={{ p: 3, mb: 3 }}> */}

                            <Typography variant="h6" key={level + '_tg_' + ind}>{`${level.charAt(0).toUpperCase() + level.slice(1)} Level`}</Typography>

                            {/* Loop through default sections */}
                            {(config.sections[level]).map((section) => (
                                <Box key={section.name} sx={{ mt: 2 }}>
                                    {/* <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={section?.enabled}
                                                    onChange={() =>
                                                        toggleSection(level, section.name)
                                                    }
                                                />
                                            }
                                            label={section?.label || section?.name.charAt(0).toUpperCase() + section?.name.slice(1)}
                                        /> */}
                                    <Typography variant="h7" sx={{ fontStyle: 'italic', fontWeight: 'bold' }}>{`${section?.label || section?.name.charAt(0).toUpperCase() + section?.name.slice(1)} `}</Typography>
                                    {section && (
                                        <>
                                            <List>
                                                {section?.fields?.map((field, index) => (
                                                    <ListItem key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                                            {field.type === 'text' && <TextField
                                                                label={field.label}
                                                                size="small"
                                                                variant="standard"
                                                                sx={{ flex: 1 }}
                                                            />}
                                                        </Box>
                                                        {['dropdown', 'checkbox', 'radio'].includes(field.type) &&
                                                            <Box key={section + field.type + index} sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                                                <FormControl sx={{ display: 'flex', flexFlow: 'column', marginRight: 2 }} component="fieldset" variant="standard">
                                                                    <FormLabel component="legend">{field.label}</FormLabel>
                                                                    <FormGroup sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                                                        gap: 1, // Adjust spacing between items as needed
                                                                        m: 0
                                                                    }}>
                                                                        {field.type === 'checkbox' &&
                                                                            field.options.map((option, index) => (
                                                                                <FormControlLabel value={option} key={index} control={<Checkbox />} label={option} />
                                                                            ))
                                                                        }

                                                                        {field.type === 'radio' && <RadioGroup row>
                                                                            {field.options.map(option => (<FormControlLabel value={option} control={<Radio />} label={option} />)
                                                                            )}
                                                                        </RadioGroup>}
                                                                        {field.type === 'dropdown' &&
                                                                            <Select
                                                                                value={field.options[0]}
                                                                                size="small"
                                                                                sx={{ flex: 1 }}
                                                                            > {field.options.map(option => (
                                                                                <MenuItem value={option}>{option}</MenuItem>
                                                                            ))}
                                                                            </Select>
                                                                        }
                                                                    </FormGroup>
                                                                </FormControl>
                                                            </Box>
                                                        }


                                                        {/* <RadioGroup row>
                                                                <FormControlLabel value="apple" control={<Radio />} label="Apple" />
                                                                <FormControlLabel value="banana" control={<Radio />} label="Banana" />
                                                                <FormControlLabel value="cherry" control={<Radio />} label="Cherry" />
                                                            </RadioGroup> */}
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </>
                                    )}
                                </Box>
                            ))}
                            {/* </Paper> */}
                        </CustomTabPanel>

                    ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }}>
                {/* Back Button */}
                <Button variant="contained" color="secondary" onClick={goBack}>
                    Back
                </Button>

                {/* Next Button (disabled for demonstration) */}
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Box>
        </div>
    );
};

export default NextStep;
