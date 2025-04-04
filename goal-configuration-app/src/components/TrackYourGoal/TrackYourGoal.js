import React, { useEffect, useRef, useState } from 'react';
import {
    Typography,
    TextField,
    Button,
    Checkbox,
    RadioGroup,
    Radio,
    FormGroup,
    FormControlLabel,
    List,
    ListItem,
    Box,
    Select,
    MenuItem,
    Tabs,
    Tab,
    CircularProgress,
    Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { deleteGoal, getGoal, saveGoal } from '../../api/services/firebaseServices';
import { useAuth } from '../../context/AuthContext';
import GenericLogic from '../../common/utils/generic-logic';
import ShowSavedGoalEvaluation from '../ShowSavedGoalEvaluation/ShowSavedGoalEvaluation';
import CONSTANTS from '../../common/constants';

const TrackYourGoal = () => {
    const { config, setHasConfiguration } = useGoalConfig();
    const { user } = useAuth();

    const [formValues, setFormValues] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const [savedData, setSavedData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [tempFormValues, setTempFormValues] = useState({});

    const isInitialLoad = useRef(true);
    const levels = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'].filter(level => config.levels[level]);
    const taskSettings = {
        daily: { level: 'weekly', task: 'taskSplitUp', value: 1 },
        weekly: { level: 'monthly', task: 'taskSplitUp', value: 7 },
        monthly: { level: 'quarterly', task: 'taskSplitUp', value: 30 },
        quarterly: { level: 'yearly', task: 'taskSplitUp', value: 90 },
    };

    const getFormatedDate = (date) => date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const level = levels[tabIndex];
                const identifier = getIdentifier(level, selectedDate); // e.g., '2025-01-13' for daily
                const data = await getGoal(user.uid, level, identifier);
                if (data) {
                    setSavedData((prev) => ({ ...prev, [level]: data }));
                    if (isInitialLoad.current) {
                        setFormValues(data);
                        if (tabIndex < levels.length - 1) {
                            setTabIndex(tabIndex + 1);
                        }
                        isInitialLoad.current = true;
                    }
                } else {
                    setSavedData((prev) => {
                        delete prev[level];
                        return { ...prev }
                    });
                    if (!isSelectedDateToday()) {
                        alert(`No data found! You might not saved any data for this ${getFormatedDate(selectedDate)} date. You may reset to today for quick reset!.`);
                    }

                };
            } catch (error) {
                console.error("Error fetching goal data:", error);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchData();
    }, [tabIndex, selectedDate]);

    const handleTabChange = (event, newIndex) => {
        isInitialLoad.current = false;
        setTabIndex(newIndex);
    };

    const isSelectedDateIsFuture = (newDate) => {
        return new Date(newDate).toISOString().split('T')[0] > new Date().toISOString().split('T')[0];
    };

    const isSelectedDateToday = () => {
        return new Date(selectedDate).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
    };

    const showDeleteButton = () => {
        return isSelectedDateToday() && new Date(selectedDate).toISOString().split('T')[0] === getIdentifier(levels[tabIndex], selectedDate);
    };

    const resetDate = () => {
        setSelectedDate(new Date());
    }

    const getIdentifier = (level, date = new Date()) => {
        const today = new Date(date);
        switch (level) {
            case 'daily':
                return today.toISOString().split('T')[0];
            case 'weekly':
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                return weekStart.toISOString().split('T')[0];
            case 'monthly':
                return `${today.getFullYear()}-${today.getMonth() + 1}`;
            case 'quarterly':
                return `${today.getFullYear()}-Q${Math.ceil((today.getMonth() + 1) / 3)}`;
            case 'yearly':
                return `${today.getFullYear()}`;
            default:
                return '';
        }
    };

    const getTask = (level, date = new Date()) => {
        const today = new Date(date);
        switch (level) {
            case 'daily':
                return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][today.getDay() - 1];
            case 'weekly':
                return `w${Math.ceil(today.getDate() / 7)}`;
            case 'monthly':
                return `m${((today.getMonth() + 1) % 3)}`;
            case 'quarterly':
                return `q${Math.ceil((today.getMonth() + 1) / 3)}`;
            // case 'yearly':
            //     return `q${Math.ceil((today.getMonth() + 1) / 3)}`;
            default:
                return '';
        }
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

    const renderField = (field, level, sectionName, index) => {
        const value = formValues[level]?.[sectionName]?.[field.name || field.label] || (field.type === 'checkbox' ? [] : '');

        switch (field.type) {
            case 'text':
                return (
                    <>
                        <Typography variant="subtitle1" sx={{ width: '100%' }}>{field.label}</Typography>
                        <TextField
                            key={`${level}-${sectionName}-${index}`}
                            size="small"
                            variant="standard"
                            value={value}
                            onChange={(e) =>
                                handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                            }
                            sx={{ flex: 1, width: '100%' }}
                            multiline
                            rows={4}
                        />
                    </>
                );

            case 'dropdown':
                return (
                    <>
                        <Typography variant="subtitle1" sx={{ width: '100%' }}>{field.label}</Typography>
                        <Select
                            key={`${level}-${sectionName}-${index}`}
                            value={value}
                            onChange={(e) =>
                                handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                            }
                            size="small"
                            sx={{ flex: 1, width: '100%' }}
                        >
                            {field.options.map((option, index) => (
                                <MenuItem value={option} key={`${(field.name || field.label)}-option-${index}`}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </>
                );

            case 'checkbox':
                return (
                    <>
                        <Typography variant="subtitle1" sx={{ width: '100%' }}>{field.label}</Typography>
                        <FormGroup key={`${level}-${sectionName}-${index}`} row sx={{ width: '100%' }}>
                            {field.options.map((option, index) => (
                                <FormControlLabel
                                    key={`${(field.name || field.label)}-checkbox-${index}`}
                                    control={
                                        <Checkbox
                                            checked={value.includes(option)}
                                            onChange={(e) => {
                                                const newValue = e.target.checked
                                                    ? [...value, option]
                                                    : value.filter((v) => v !== option);
                                                handleInputChange(level, sectionName, (field.name || field.label), newValue);
                                            }}
                                            size="small"
                                        />
                                    }
                                    label={option}
                                    sx={{ mr: 2 }}
                                />
                            ))}
                        </FormGroup>
                    </>
                );

            case 'radio':
                return (
                    <>
                        <Typography variant="subtitle1" sx={{ width: '100%' }}>{field.label}</Typography>
                        <RadioGroup
                            key={`${level}-${sectionName}-${index}`}
                            row
                            value={value}
                            onChange={(e) =>
                                handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                            }
                            sx={{ width: '100%' }}
                        >
                            {field.options.map((option, index) => (
                                <FormControlLabel
                                    key={`${(field.name || field.label)}-radio-${index}`}
                                    value={option}
                                    control={<Radio size="small" />}
                                    label={option}
                                    sx={{ mr: 2 }}
                                />
                            ))}
                        </RadioGroup>
                    </>
                );

            default:
                return null;
        }
    };

    const handleSubmit = async (action) => {
        const level = levels[tabIndex];
        const identifier = getIdentifier(level, selectedDate);
        switch (action) {
            case 'delete':
                await deleteGoal(user.uid, level, identifier);
                setSavedData((prev) => {
                    const updatedData = { ...prev };
                    delete updatedData[level];
                    return updatedData;
                });
                setFormValues((prev) => {
                    const updatedValues = { ...prev };
                    delete updatedValues[level];
                    return updatedValues;
                });
                alert(`${level} goals deleted successfully!`);
                break;
            case 'edit':
                setTempFormValues(JSON.parse(JSON.stringify(savedData[level])));
                setFormValues((prev) => ({
                    ...prev,
                    [level]: savedData[level]
                }));
                setEditMode(true);
                break;
            case 'save':
                await saveGoal(formValues[level], user.uid, level, identifier);
                setSavedData((prev) => ({
                    ...prev,
                    [level]: formValues[level],
                }));
                setEditMode(false);
                alert(`${level} goals updated successfully!`);
                break;
            case 'cancel':
                setFormValues((prev) => ({
                    ...prev,
                    [level]: tempFormValues,
                }));
                setEditMode(false);
                break;
            default:
                await saveGoal(formValues[level], user.uid, level, identifier);
                setSavedData((prev) => ({
                    ...prev,
                    [level]: formValues[level],
                }));
                if (levels.length > tabIndex + 1)
                    setTabIndex(tabIndex + 1);
                alert(`${level} goals saved successfully on ${getFormatedDate(selectedDate)}!`);
                break;
        }
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const handlePrevNextClick = (direction) => {
        let newDate = new Date(selectedDate);
        if (levels[tabIndex] === 'daily') {
            newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1)); // Move one day back or forward
        } else if (levels[tabIndex] === 'weekly') {
            newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7)); // Move one week back or forward
        } else if (levels[tabIndex] === 'monthly') {
            newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1)); // Move one month back or forward
        } else if (levels[tabIndex] === 'quarterly') {
            newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -3 : 3)); // Move one quarter back or forward
        } else if (levels[tabIndex] === 'yearly') {
            newDate.setFullYear(newDate.getFullYear() + (direction === 'prev' ? -1 : 1)); // Move one year back or forward
        }
        if (isSelectedDateIsFuture(newDate) && direction === 'next') {
            alert(`Not allowing future ${levels[tabIndex]} plan.`);
        } else {
            setSelectedDate(newDate);
        }
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Button variant="outlined" onClick={() => handlePrevNextClick('prev')} disabled={loading}>
                        Previous
                    </Button>
                    <Typography variant="subtitle1">
                        {getFormatedDate(selectedDate)}
                        {!isSelectedDateToday() && (
                            <Button size="small" onClick={resetDate} sx={{ ml: 1 }}>
                                Reset to Today
                            </Button>
                        )}
                    </Typography>
                    <Button variant="outlined" onClick={() => handlePrevNextClick('next')} disabled={loading || isSelectedDateIsFuture(selectedDate)}>
                        Next
                    </Button>
                </Stack>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="goal tracking tabs" variant='scrollable' scrollButtons="auto" allowScrollButtonsMobile>
                    {levels.map((level, index) => (
                        <Tab key={level} label={level} {...a11yProps(index)} />
                    ))}
                </Tabs>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {savedData[levels[tabIndex]] && !editMode && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                                startIcon={<EditIcon />}
                                variant="contained"
                                color="primary"
                                onClick={() => handleSubmit('edit')}
                            >
                                Edit
                            </Button>
                            {showDeleteButton() && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleSubmit('delete')}
                                >
                                    Delete
                                </Button>
                            )}
                        </Box>
                    )}
                    {editMode && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                                startIcon={<SaveIcon />}
                                variant="contained"
                                color="success"
                                onClick={() => handleSubmit('save')}
                            >
                                Save
                            </Button>
                            <Button
                                startIcon={<CancelIcon />}
                                variant="contained"
                                color="error"
                                onClick={() => handleSubmit('cancel')}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                    
                    <Typography variant='subtitle1'>
                        <strong>{CONSTANTS.LEVEL[levels[tabIndex]?.toLocaleUpperCase()]}</strong> {getIdentifier(levels[tabIndex], selectedDate)}
                    </Typography>

                    {/* Display saved data or edit form */}
                    {savedData[levels[tabIndex]] && !editMode ? (
                        <Box>
                            <ShowSavedGoalEvaluation 
                                savedData={savedData[levels[tabIndex]]} 
                                config={config.sections[levels[tabIndex]]} 
                                level={levels[tabIndex]}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ p: 1, width: '100%' }}>
                            {/* Show parent goal if exists */}
                            {savedData[taskSettings[levels[tabIndex]]?.level]?.taskSplitUp && 
                             savedData[taskSettings[levels[tabIndex]]?.level]?.taskSplitUp?.[getTask(levels[tabIndex], selectedDate)] && (
                                <Typography variant="body1" sx={{ fontSize: "15px", textAlign: "left", marginBottom: "15px" }}>
                                    <strong>{GenericLogic.capitalizeFirstLetter(levels[tabIndex])} Goal: </strong>
                                    {GenericLogic.capitalizeFirstLetter(savedData[taskSettings[levels[tabIndex]]?.level]?.taskSplitUp?.[getTask(levels[tabIndex], selectedDate)])}
                                </Typography>
                            )}
                            
                            {/* Render form fields */}
                            {config.sections[levels[tabIndex]].map((section) => section.enabled && (
                                <Box key={`section-${levels[tabIndex]}-${section.name}`} sx={{ mt: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontStyle: 'italic', fontWeight: 'bold', mb: 2 }}
                                    >
                                        {section.label || section.name}
                                    </Typography>
                                    <List sx={{ width: '100%' }}>
                                        {section.fields.map((field, index) => (
                                            <ListItem
                                                key={`field-${levels[tabIndex]}-${section.name}-${index}`}
                                                sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    alignItems: 'flex-start', 
                                                    width: '100%',
                                                    py: 1
                                                }}
                                            >
                                                {renderField(field, levels[tabIndex], section.name, index)}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            ))}
                            
                            {/* Show save button only when not in edit mode */}
                            {!editMode && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleSubmit()}
                                    sx={{ mt: 2 }}
                                >
                                    Save {levels[tabIndex]} Goals
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default TrackYourGoal;
