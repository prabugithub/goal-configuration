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
} from '@mui/material';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { getGoal, saveGoal } from '../../api/services/firebaseServices';
import { useAuth } from '../../context/AuthContext';
import GenericLogic from '../../common/utils/generic-logic';
import ShowSavedGoalEvaluation from '../ShowSavedGoalEvaluation/ShowSavedGoalEvaluation';
import  CONSTANTS  from '../../common/constants';

const TrackYourGoal = () => {
    const { config } = useGoalConfig();
    const { user } = useAuth();

    const [formValues, setFormValues] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const [savedData, setSavedData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const isInitialLoad = useRef(true);
    const levels = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'].filter(level => config.levels[level]);

    const getFormatedDate = (date) => date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();

    useEffect(() => {
        const fetchData = async () => {
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
                    return { ...prev }});
                alert(`No data found! You might not saved any data for this ${getFormatedDate(selectedDate)} date.`);
            };
        };

        fetchData();
    }, [tabIndex, selectedDate]);

    const handleTabChange = (event, newIndex) => {
        isInitialLoad.current = false;
        // if(levels[newIndex] !== 'daily') {
        //     setSelectedDate(getIdentifier(levels[newIndex]));
        // }
        setTabIndex(newIndex);
    };

    const isSelectedDateIsFuture = () => { 
        return new Date(selectedDate).toISOString().split('T')[0] > new Date().toISOString().split('T')[0];
    };

    const isSelectedDateToday = () => { 
        return new Date(selectedDate).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
    };

    const resetDate = () => { 
        setSelectedDate(new Date());
    }

    const getIdentifier = (level, date = new Date()) => {
        const today =  new Date(date);
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

    const handleSubmit = async () => {
        const level = levels[tabIndex];
        const identifier = getIdentifier(level, selectedDate);
        await saveGoal(formValues[level], user.uid, level, identifier);
        alert(`${level} goals saved successfully!`);
        if (levels.length > tabIndex + 1)
            setTabIndex(tabIndex + 1);
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
        if (isSelectedDateIsFuture(newDate)) {
            alert('You can not select future date.');
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
            <Typography variant="h5" gutterBottom>
                Your Onething!
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Goal levels" key="levels_tab">
                    {levels
                        .filter((level) => config.levels[level])
                        .map((level, index) => (
                            <Tab label={level} {...a11yProps(index)} key={'tab_' + index} />
                        ))}
                </Tabs>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <div><Button onClick={() => resetDate()} variant="contained" disabled={isSelectedDateToday()} sx={{ marginRight: "10px" }}>Reset to Today</Button><Typography variant='subtitle1'><strong>{CONSTANTS.LEVEL[levels[tabIndex]?.toLocaleUpperCase()]}</strong> {getIdentifier(levels[tabIndex], selectedDate)}</Typography></div>

                <div>
                    <Button onClick={() => handlePrevNextClick('prev')} variant="contained" sx={{ marginRight: "10px" }}>Prev</Button>
                    <Button onClick={() => handlePrevNextClick('next')} variant="contained" disabled={isSelectedDateToday()}>Next</Button>
                </div>
            </Box>

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
                            <Box sx={{ p: 3, width: '100%' }}>
                                <Box>
                                    {GenericLogic.numberArray(2, 1).map((len) => (levels[tabIndex - len] && savedData[levels[tabIndex - len]] && savedData[levels[tabIndex - len]]['planning'] && savedData[levels[tabIndex - len]]['planning']['One Thing'] ?
                                        <>
                                            <Typography variant="h6" sx={{ textTransform: 'capitalize', display: 'flex', width: '100%' }}>{levels[tabIndex - len]} Goals:</Typography>
                                            <Typography variant="body1" sx={{ display: 'flex', width: '100%' }}>
                                                {GenericLogic.capitalizeFirstLetter(savedData[levels[tabIndex - len]]['planning']['One Thing'])}
                                            </Typography>
                                        </>
                                        : <></>))}
                                </Box>
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

            {savedData[levels[tabIndex]] ? <></> : (
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>)}
        </div>
    );
};

export default TrackYourGoal;
