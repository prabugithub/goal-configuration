import React, { useEffect, useRef, useState } from 'react';
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
    CircularProgress
} from '@mui/material';
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

    const isInitialLoad = useRef(true);
    const levels = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'].filter(level => config.levels[level]);
    const taskSettings = {
        daily: { level: 'weekly', task:'taskSplitUp', value: 1 },
        weekly: { level: 'monthly', task:'taskSplitUp', value: 7 },
        monthly: { level: 'quarterly', task:'taskSplitUp', value: 30 },
        quarterly: { level: 'yearly', task:'taskSplitUp', value: 90 },
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
                return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][today.getDay()-1];
            case 'weekly':
                return `w${Math.ceil(today.getDate()/7)}`;
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
                alert(`${level} goals saved successfully on the date: ${getFormatedDate(selectedDate)}!`);
                break;
            default:
                await saveGoal(formValues[level], user.uid, level, identifier);
                setSavedData((prev) => ({
                    ...prev,
                    [level]: formValues[level],
                }));
                if (levels.length > tabIndex + 1)
                    setTabIndex(tabIndex + 1);
                alert(`${level} goals successfully on ${getFormatedDate(selectedDate)}!`);
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

    const renderField = (field, level, sectionName, index) => {
        const value =
            formValues[level]?.[sectionName]?.[field.name || field.label] || (field.type === 'checkbox' ? [] : '');

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
                            handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                        }
                        sx={{ flex: 1, width: '100%' }}
                    />
                );

            case 'dropdown':
                return (
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
                                        />
                                    }
                                    label={option}
                                />
                            ))}
                        </FormGroup>
                    </>
                );

            case 'radio':
                return (
                    <React.Fragment>
                        <Typography variant="subtitle1" sx={{
                            width: '100%', // Ensure the RadioGroup takes full width
                        }}>{field.label}</Typography>
                        <RadioGroup
                            key={`${level}-${sectionName}-${index}`}
                            row
                            value={value}
                            onChange={(e) =>
                                handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                            }
                            sx={{
                                width: '100%', // Ensure the RadioGroup takes full width
                            }}
                        >
                            {field.options.map((option, index) => (
                                <FormControlLabel
                                    key={`${(field.name || field.label)}-radio-${index}`}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                />
                            ))}
                        </RadioGroup>
                    </React.Fragment>

                );

            default:
                return null;
        }
    };

    return (
        <div>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto', position: 'sticky', top: 60, zIndex: 100, background: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: .25 }}>
                    <div><Button onClick={() => resetDate()} variant="contained" disabled={isSelectedDateToday()} sx={{ marginRight: "10px" }}>Reset to Today</Button></div>

                    <div>
                        <Button onClick={() => handlePrevNextClick('prev')} variant="contained" sx={{ marginRight: "10px" }}>Prev</Button>
                        <Button onClick={() => handlePrevNextClick('next')} variant="contained" disabled={isSelectedDateToday()}>Next</Button>
                    </div>
                </Box>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Goal levels" key="levels_tab" variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile>
                    {levels
                        .filter((level) => config.levels[level])
                        .map((level, index) => (
                            <Tab label={level} {...a11yProps(index)} key={'tab_' + index} />
                        ))}
                </Tabs>
            </Box>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <div>
                  <Typography variant='subtitle1'><strong>{CONSTANTS.LEVEL[levels[tabIndex]?.toLocaleUpperCase()]}</strong> {getIdentifier(levels[tabIndex], selectedDate)}</Typography>

                    {levels
                        .filter((level) => config.levels[level])
                        .map((level, index) => (
                            <div
                                key={`tabpanel-${level}-${index}`}
                                role="tabpanel"
                                hidden={tabIndex !== index}
                                id={`tabpanel-${index}`}
                            >
                                {tabIndex === index && savedData[level] ? (
                                    <Box>
                                        {/* <Typography variant="h6">Saved {level} Goals</Typography> */}
                                        <ShowSavedGoalEvaluation savedData={savedData[level]} config={config.sections[level]} level={level}></ShowSavedGoalEvaluation>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 1, width: '100%' }}>
                                        <Box>
                                            {
                                                savedData[taskSettings[level]?.level]?.taskSplitUp && savedData[taskSettings[level]?.level]?.taskSplitUp?.[getTask(level, selectedDate)] ?
                                                
                                                <Typography variant="body1" sx={{ fontSize: "15px", textAlign: "left", marginBottom: "15px" }}>
                                                    <strong>{GenericLogic.capitalizeFirstLetter(levels[tabIndex])} Goal: </strong>{GenericLogic.capitalizeFirstLetter(savedData[taskSettings[level]?.level]?.taskSplitUp?.[getTask(level, selectedDate)])}
                                                </Typography>
                                        
                                            : <></>
                                            }
                                        </Box>
                                        {config.sections[level].map((section) => section.enabled && (
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

                    {savedData[levels[tabIndex]] ? showDeleteButton() ? <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }} key={'delete_button'}>
                            <Button variant="contained" color="secondary" onClick={() => handleSubmit('delete')}>
                                Delete
                            </Button></Box>
                    </> : <></> : (
                        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }} key={'submit_button'}>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Save
                            </Button>
                        </Box>)}

                </div>)} {/* Empty div to avoid error in the return statement */}

        </div>
    );
};

export default TrackYourGoal;
