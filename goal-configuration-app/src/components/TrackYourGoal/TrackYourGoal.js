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
    CircularProgress,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    InputAdornment,
    Slider,
    Rating,
    Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import NumbersIcon from '@mui/icons-material/Numbers';
import PercentIcon from '@mui/icons-material/Percent';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TimerIcon from '@mui/icons-material/Timer';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { deleteGoal, getGoal, saveGoal } from '../../api/services/firebaseServices';
import { useAuth } from '../../context/AuthContext';
import GenericLogic from '../../common/utils/generic-logic';
import ShowSavedGoalEvaluation from '../ShowSavedGoalEvaluation/ShowSavedGoalEvaluation';
import BreadcrumbNavigation from '../BreadcrumbNavigation/BreadcrumbNavigation';
import MissingMonthlyPlanDialog from '../MissingMonthlyPlanDialog/MissingMonthlyPlanDialog';
import { useMonthlyPlanningCheck } from '../../hooks/useMonthlyPlanningCheck';
import { getMonthlyPlanningDate } from '../../common/utils/planningDateUtils';
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
    const [todoOpen, setTodoOpen] = useState(false);
    const [yesterdayTodo, setYesterdayTodo] = useState("");

    const isInitialLoad = useRef(true);
    const levels = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'].filter(level => config.levels[level]);
    const taskSettings = {
        daily: { level: 'weekly', task: 'taskSplitUp', value: 1 },
        weekly: { level: 'monthly', task: 'taskSplitUp', value: 7 },
        monthly: { level: 'quarterly', task: 'taskSplitUp', value: 30 },
        quarterly: { level: 'yearly', task: 'taskSplitUp', value: 90 },
    };

    // Monthly planning check hook (must be after levels is defined)
    const monthlyCheck = useMonthlyPlanningCheck(
        levels[tabIndex] === 'weekly' ? selectedDate : null,
        savedData
    );

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
        // handleOpenTodoDialog();
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
                const todayStr = today;
                todayStr.setTime(todayStr.getTime() - (todayStr.getTimezoneOffset() * 60000));
                return todayStr.toISOString().substring(0, 19).split('T')[0];
            // return today.toISOString().split('T')[0];
            case 'weekly':
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                weekStart.setTime(weekStart.getTime() - (weekStart.getTimezoneOffset() * 60000));
                let dateAsString = weekStart.toISOString().substring(0, 19);
                // return dateAsString;
                return dateAsString.split('T')[0];
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
        const index = (today.getDay() - 1) === -1 ? 6 : (today.getDay() - 1);
        switch (level) {
            case 'daily':
                return ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][index];
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

    // Helper function to get icon for field type
    const getFieldIcon = (fieldType) => {
        switch (fieldType) {
            case 'time':
                return <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'number':
                return <NumbersIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'text':
                return <TextFieldsIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'dropdown':
                return <ArrowDropDownIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'checkbox':
                return <CheckBoxIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'radio':
                return <RadioButtonCheckedIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'percentage':
                return <PercentIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'progress':
                return <TrackChangesIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'duration':
                return <TimerIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            default:
                return null;
        }
    };

    const renderField = (field, level, sectionName, index) => {
        const value = formValues[level]?.[sectionName]?.[field.name || field.label] || (field.type === 'checkbox' ? [] : '');

        switch (field.type) {
            case 'text':
                return (
                    <TextField
                        key={`${level}-${sectionName}-${index}`}
                        label={field.label}
                        size="small"
                        variant="outlined"
                        value={value}
                        onChange={(e) =>
                            handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                        }
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'grey.50',
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                },
                                '&.Mui-focused': {
                                    bgcolor: 'background.paper',
                                }
                            }
                        }}
                        multiline
                        rows={4}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {getFieldIcon(field.type)}
                                </InputAdornment>
                            ),
                        }}
                    />
                );


            // Rating field - use star rating component
            case 'number':
                if (field.name.includes('rating') || field.label.toLowerCase().includes('rating')) {
                    const ratingValue = Number(value) || 0;
                    const maxRating = 10;

                    return (
                        <Box
                            key={`${level}-${sectionName}-${index}`}
                            sx={{ width: '100%' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" fontWeight={500}>
                                    {field.label}
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    {ratingValue}/{maxRating}
                                </Typography>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                bgcolor: 'grey.50',
                                borderRadius: 1,
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                }
                            }}>
                                <Rating
                                    value={ratingValue}
                                    max={maxRating}
                                    size="large"
                                    precision={1}
                                    onChange={(event, newValue) => {
                                        handleInputChange(level, sectionName, (field.name || field.label), newValue || 0);
                                    }}
                                    sx={{
                                        color: 'warning.main',
                                        '& .MuiRating-iconEmpty': {
                                            color: 'grey.300'
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    );
                }
            // Fall through to regular number input if not a rating field

            case 'time':
                return (
                    <TextField
                        key={`${level}-${sectionName}-${index}`}
                        label={field.label}
                        size="small"
                        variant="outlined"
                        type="number"
                        value={value}
                        onChange={(e) =>
                            handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                        }
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'grey.50',
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                },
                                '&.Mui-focused': {
                                    bgcolor: 'background.paper',
                                }
                            }
                        }}
                        inputProps={{ min: 0 }}
                        placeholder={field.type === 'time' ? 'Enter time in minutes' : 'Enter number'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {getFieldIcon(field.type)}
                                </InputAdornment>
                            ),
                        }}
                    />
                );

            case 'dropdown':
                return (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            {getFieldIcon(field.type)}
                            <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                {field.label}
                            </Typography>
                        </Box>
                        <Select
                            key={`${level}-${sectionName}-${index}`}
                            value={value}
                            onChange={(e) =>
                                handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                            }
                            size="small"
                            displayEmpty
                            sx={{
                                width: '100%',
                                bgcolor: 'grey.50',
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                },
                                '&.Mui-focused': {
                                    bgcolor: 'background.paper',
                                }
                            }}
                        >
                            <MenuItem value="" disabled>
                                <em>Select {field.label.toLowerCase()}</em>
                            </MenuItem>
                            {field.options.map((option, index) => (
                                <MenuItem value={option} key={`${(field.name || field.label)}-option-${index}`}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                );

            case 'checkbox':
                // Check if this is a Yes/No field (switch component)
                const isYesNoField = field.options &&
                    field.options.length === 2 &&
                    field.options.some(opt => opt.toLowerCase() === 'yes') &&
                    field.options.some(opt => opt.toLowerCase() === 'no');

                if (isYesNoField) {
                    // Use Switch for Yes/No fields
                    const isYes = Array.isArray(value)
                        ? value.some(v => v.toLowerCase() === 'yes')
                        : (typeof value === 'string' ? value.toLowerCase() === 'yes' : false);

                    return (
                        <Box
                            key={`${level}-${sectionName}-${index}`}
                            sx={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: 'grey.50',
                                borderRadius: 1,
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getFieldIcon(field.type)}
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                    {field.label}
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isYes}
                                        onChange={(e) => {
                                            const newValue = e.target.checked ? 'Yes' : 'No';
                                            handleInputChange(level, sectionName, (field.name || field.label), [newValue]);
                                        }}
                                        color="primary"
                                    />
                                }
                                label={isYes ? 'Yes' : 'No'}
                                labelPlacement="start"
                                sx={{
                                    m: 0,
                                    '& .MuiTypography-root': {
                                        fontWeight: 600,
                                        color: isYes ? 'success.main' : 'text.secondary',
                                        mr: 1
                                    }
                                }}
                            />
                        </Box>
                    );
                }

                // Use regular checkboxes for multi-option fields
                return (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {getFieldIcon(field.type)}
                            <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                {field.label}
                            </Typography>
                        </Box>
                        <FormGroup key={`${level}-${sectionName}-${index}`} row sx={{ width: '100%', pl: 1 }}>
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
                    </Box>
                );

            case 'radio':
                return (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {getFieldIcon(field.type)}
                            <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                {field.label}
                            </Typography>
                        </Box>
                        <RadioGroup
                            key={`${level}-${sectionName}-${index}`}
                            row
                            value={value}
                            onChange={(e) =>
                                handleInputChange(level, sectionName, (field.name || field.label), e.target.value)
                            }
                            sx={{ width: '100%', pl: 1 }}
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
                    </Box>
                );


            case 'percentage':
                return (
                    <Box sx={{ width: '100%', px: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getFieldIcon(field.type)}
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                    {field.label}
                                </Typography>
                            </Box>
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                {value || 0}%
                            </Typography>
                        </Box>
                        <Slider
                            key={`${level}-${sectionName}-${index}`}
                            value={Number(value) || 0}
                            onChange={(e, newValue) =>
                                handleInputChange(level, sectionName, (field.name || field.label), newValue)
                            }
                            min={field.min || 0}
                            max={field.max || 100}
                            step={field.step || 5}
                            marks={[
                                { value: 0, label: '0%' },
                                { value: 50, label: '50%' },
                                { value: 100, label: '100%' }
                            ]}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(v) => `${v}%`}
                            sx={{
                                '& .MuiSlider-markLabel': {
                                    fontSize: '0.75rem'
                                }
                            }}
                        />
                    </Box>
                );

            case 'progress':
                const total = field.total || 5;
                const completed = Number(value) || 0;
                const percentage = (completed / total) * 100;

                return (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getFieldIcon(field.type)}
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                    {field.label}
                                </Typography>
                            </Box>
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                {completed} / {total}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                                key={`${level}-${sectionName}-${index}`}
                                type="number"
                                value={completed}
                                onChange={(e) => {
                                    const newValue = Math.min(Math.max(0, Number(e.target.value)), total);
                                    handleInputChange(level, sectionName, (field.name || field.label), newValue);
                                }}
                                size="small"
                                variant="outlined"
                                inputProps={{ min: 0, max: total }}
                                sx={{
                                    width: '100px',
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'grey.50'
                                    }
                                }}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{
                                    height: 8,
                                    bgcolor: 'grey.200',
                                    borderRadius: 1,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        height: '100%',
                                        width: `${percentage}%`,
                                        bgcolor: 'success.main',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {percentage.toFixed(0)}% complete
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                );

            case 'duration':
                const totalMinutes = Number(value) || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                return (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {getFieldIcon(field.type)}
                            <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                {field.label}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                label="Hours"
                                type="number"
                                value={hours}
                                onChange={(e) => {
                                    const newHours = Math.max(0, Number(e.target.value));
                                    const newTotal = (newHours * 60) + minutes;
                                    handleInputChange(level, sectionName, (field.name || field.label), newTotal);
                                }}
                                size="small"
                                variant="outlined"
                                inputProps={{ min: 0, max: 24 }}
                                sx={{
                                    width: '100px',
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'grey.50'
                                    }
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">h</InputAdornment>
                                }}
                            />
                            <TextField
                                label="Minutes"
                                type="number"
                                value={minutes}
                                onChange={(e) => {
                                    const newMinutes = Math.min(Math.max(0, Number(e.target.value)), 59);
                                    const newTotal = (hours * 60) + newMinutes;
                                    handleInputChange(level, sectionName, (field.name || field.label), newTotal);
                                }}
                                size="small"
                                variant="outlined"
                                inputProps={{ min: 0, max: 59 }}
                                sx={{
                                    width: '100px',
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'grey.50'
                                    }
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">m</InputAdornment>
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                = {totalMinutes} minutes
                            </Typography>
                        </Stack>
                    </Box>
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

    const handleOpenTodoDialog = async () => {
        const level = levels[tabIndex];
        const identifier = getIdentifier(level, selectedDate); // e.g., '2025-01-13' for daily
        const todo = await getGoal(user.uid, level, identifier);
        setYesterdayTodo(todo);
        setTodoOpen(true);
    };

    const handleNavigateToMissingMonthlyPlan = () => {
        // Find the index of the monthly level
        const monthlyIndex = levels.indexOf('monthly');
        if (monthlyIndex >= 0) {
            // Set selected date to the monthly planning date for that month
            const planningDate = getMonthlyPlanningDate(selectedDate);
            setSelectedDate(planningDate);
            // Switch to monthly tab
            setTabIndex(monthlyIndex);
            // Reset the dismissal so the dialog shows if needed again
            monthlyCheck.reset();
        }
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            {/* Missing Monthly Planning Dialog */}
            <MissingMonthlyPlanDialog
                open={monthlyCheck.hasMissing}
                monthInfo={monthlyCheck.monthInfo}
                onNavigateToMonth={handleNavigateToMissingMonthlyPlan}
                onDismiss={monthlyCheck.dismiss}
            />

            <Dialog open={todoOpen} onClose={() => setTodoOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Yesterday's To-Do List</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {yesterdayTodo}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTodoOpen(false)} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
            {/* <Button onClick={handleOpenTodoDialog} variant="outlined" color="primary">
                View Yesterday's To-Do
            </Button> */}

            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                selectedDate={selectedDate}
                currentLevel={levels[tabIndex]}
                onLevelChange={handleTabChange}
                levels={levels}
                savedData={savedData}
            />

            {/* Date Navigation Controls */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 2 }}>
                <Button variant="outlined" size="small" onClick={() => handlePrevNextClick('prev')} disabled={loading}>
                    Previous
                </Button>
                {!isSelectedDateToday() && (
                    <Button variant="contained" size="small" onClick={resetDate} color="secondary">
                        Reset to Today
                    </Button>
                )}
                <Button variant="outlined" size="small" onClick={() => handlePrevNextClick('next')} disabled={loading || isSelectedDateIsFuture(selectedDate)}>
                    Next
                </Button>
            </Stack>

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
                                <Paper
                                    key={`section-${levels[tabIndex]}-${section.name}`}
                                    elevation={2}
                                    sx={{
                                        p: 2.5,
                                        mb: 2.5,
                                        borderRadius: 2,
                                        borderLeft: '4px solid',
                                        borderColor: 'primary.main',
                                        bgcolor: 'background.paper'
                                    }}
                                >
                                    {/* Section Header with colored background */}
                                    <Box
                                        sx={{
                                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                                            p: 1.5,
                                            mb: 2,
                                            borderRadius: 1
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}
                                        >
                                            {section.label || section.name}
                                        </Typography>
                                    </Box>

                                    {/* Fields in Stack */}
                                    <Stack spacing={2}>
                                        {section.fields.map((field, index) => (
                                            <Box key={`field-${levels[tabIndex]}-${section.name}-${index}`} sx={{ width: '100%' }}>
                                                {renderField(field, levels[tabIndex], section.name, index)}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>
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
