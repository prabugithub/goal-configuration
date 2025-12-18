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
    Switch,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import NumbersIcon from '@mui/icons-material/Numbers';
import PercentIcon from '@mui/icons-material/Percent';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TimerIcon from '@mui/icons-material/Timer';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useGoalConfig } from '../../context/GoalConfigContext';
import { deleteGoal, getGoal, saveGoal } from '../../api/services/firebaseServices';
import { useAuth } from '../../context/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import { useMetrics } from '../../hooks/useMetrics';
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
    const { goals } = useGoals(user?.uid);
    const metrics = useMetrics(goals, config);

    const [formValues, setFormValues] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const [savedData, setSavedData] = useState({});
    const [previousDayData, setPreviousDayData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [tempFormValues, setTempFormValues] = useState({});
    const [todoOpen, setTodoOpen] = useState(false);
    const [yesterdayTodo, setYesterdayTodo] = useState("");
    const [newTaskInputs, setNewTaskInputs] = useState({});

    const isInitialLoad = useRef(true);
    const loadedTabs = useRef(new Set()); // Track which tabs have been loaded
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

    // Helper function to check if a field should be displayed based on conditional logic
    const shouldShowField = (field, section, level) => {
        // Find the controlling field by checking if any field in the section has a conditionalField pointing to this field
        const controllingField = section?.fields?.find(f =>
            f.conditionalField && f.conditionalField.targetFieldName === field.name
        );

        // If no controlling field found, always show the field
        if (!controllingField) {
            return true;
        }

        // If this field is controlled by another field, check the condition
        const controlValue = formValues[level]?.[section.name]?.[controllingField.name || controllingField.label];
        const condition = controllingField.conditionalField.condition;
        const thresholdValue = controllingField.conditionalField.value;

        // Evaluate the condition
        switch (condition) {
            case '<':
                return Number(controlValue) < thresholdValue;
            case '<=':
                return Number(controlValue) <= thresholdValue;
            case '>':
                return Number(controlValue) > thresholdValue;
            case '>=':
                return Number(controlValue) >= thresholdValue;
            case '==':
            case '===':
                return controlValue == thresholdValue;
            case '!=':
            case '!==':
                return controlValue != thresholdValue;
            default:
                return true;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const level = levels[tabIndex];
            const identifier = getIdentifier(level, selectedDate);
            const tabKey = `${level}-${identifier}`;

            // Only show loading if this tab hasn't been loaded before
            const isTabLoaded = loadedTabs.current.has(tabKey);
            if (!isTabLoaded) {
                setLoading(true);
            }

            try {
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

                // If daily level, fetch previous day's data for task carry-over
                if (level === 'daily') {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    const prevIdentifier = getIdentifier('daily', prevDate);
                    const prevData = await getGoal(user.uid, 'daily', prevIdentifier);
                    setPreviousDayData(prevData);
                } else {
                    setPreviousDayData(null);
                }
                if ((!data || tabIndex === levels.length - 1) || (isInitialLoad.current === false && data)) {
                    setLoading(false);
                }
                // Mark this tab as loaded
                loadedTabs.current.add(tabKey);
            } catch (error) {
                console.error("Error fetching goal data:", error);
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
        // Clear loaded tabs cache when resetting date
        loadedTabs.current.clear();
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
            case 'rating':
                return <NumbersIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'text':
                return <TextFieldsIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'dropdown':
                return <ArrowDropDownIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'checkbox':
                return <CheckBoxIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'radio':
                return <RadioButtonCheckedIcon sx={{ fontSize: 18, mr: 0.5 }} />;
            case 'boolean':
                return <ToggleOnIcon sx={{ fontSize: 18, mr: 0.5 }} />;
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

    // Helper to calculate completion for task list
    const calculateTaskCompletion = (tasks) => {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.done).length;
        return Math.round((completed / tasks.length) * 100);
    };

    const renderField = (field, level, sectionName, index) => {
        const value = formValues[level]?.[sectionName]?.[field.name || field.label] || (field.type === 'checkbox' ? [] : '');
        const section = config.sections[level].find(s => s.name === sectionName);

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
            case 'rating':
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

            case 'number':
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

            case 'boolean':
                // Boolean field with Switch component - displays any provided options
                const boolValue = Array.isArray(value)
                    ? (value.length > 0 && value[0])
                    : value;

                const isCheckedBool = field.options && field.options.length >= 2
                    ? (boolValue === field.options[0] || boolValue === true)
                    : (boolValue === 'Yes' || boolValue === true);

                const trueLabel = field.options && field.options.length >= 2 ? field.options[0] : 'Yes';
                const falseLabel = field.options && field.options.length >= 2 ? field.options[1] : 'No';

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
                                    checked={isCheckedBool}
                                    onChange={(e) => {
                                        const newValue = e.target.checked ? trueLabel : falseLabel;
                                        handleInputChange(level, sectionName, (field.name || field.label), [newValue]);
                                    }}
                                    color="primary"
                                />
                            }
                            label={isCheckedBool ? trueLabel : falseLabel}
                            labelPlacement="start"
                            sx={{
                                m: 0,
                                '& .MuiTypography-root': {
                                    fontWeight: 600,
                                    color: isCheckedBool ? 'success.main' : 'text.secondary',
                                    mr: 1
                                }
                            }}
                        />
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
            case 'tasklist':
                // Check if this field targets another section (Planning Mode)
                // Fallback: also treat 'organize' section as planning mode by default to ensure completion is hidden
                const isPlanningMode = !!section.targetSection || section.name === 'organize';

                // Structure: { tasks: [], manualOverride: boolean, completion: number }
                // or just handle if it's undefined
                const taskData = value || { tasks: [], manualOverride: false, completion: 0 };
                const tasks = taskData.tasks || [];
                const completion = taskData.completion || 0;
                const newTaskText = newTaskInputs[`${level}-${sectionName}-${field.name}`] || '';

                const handleTaskAdd = () => {
                    if (!newTaskText.trim()) return;

                    const newTasks = [
                        ...tasks,
                        { id: Date.now().toString(), text: newTaskText.trim(), done: false }
                    ];

                    // In Planning Mode, we don't calculate completion
                    const newCompletion = isPlanningMode ? 0 : (taskData.manualOverride ? completion : calculateTaskCompletion(newTasks));

                    handleInputChange(level, sectionName, (field.name || field.label), {
                        ...taskData,
                        tasks: newTasks,
                        completion: newCompletion
                    });

                    setNewTaskInputs(prev => ({
                        ...prev,
                        [`${level}-${sectionName}-${field.name}`]: ''
                    }));
                };

                const handleTaskToggle = (taskId) => {
                    // In Planning Mode, toggling might not be allowed or needed, 
                    // but if we do allow it, it shouldn't affect completion if strictly planning.

                    const newTasks = tasks.map(t =>
                        t.id === taskId ? { ...t, done: !t.done } : t
                    );

                    const newCompletion = isPlanningMode ? 0 : (taskData.manualOverride ? completion : calculateTaskCompletion(newTasks));

                    handleInputChange(level, sectionName, (field.name || field.label), {
                        ...taskData,
                        tasks: newTasks,
                        completion: newCompletion
                    });
                };

                const handleTaskDelete = (taskId) => {
                    const newTasks = tasks.filter(t => t.id !== taskId);

                    const newCompletion = isPlanningMode ? 0 : (taskData.manualOverride ? completion : calculateTaskCompletion(newTasks));

                    handleInputChange(level, sectionName, (field.name || field.label), {
                        ...taskData,
                        tasks: newTasks,
                        completion: newCompletion
                    });
                };

                return (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getFieldIcon(field.type)}
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                    {field.label}
                                </Typography>
                            </Box>
                            {!isPlanningMode && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                        {completion}% Done
                                    </Typography>
                                    {tasks.length > 0 && (
                                        <Typography variant="caption" color="text.secondary">
                                            ({tasks.filter(t => t.done).length}/{tasks.length})
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* Add Task Input */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder={isPlanningMode ? "Plan a task for tomorrow..." : "Add a new task..."}
                                value={newTaskText}
                                onChange={(e) => setNewTaskInputs(prev => ({
                                    ...prev,
                                    [`${level}-${sectionName}-${field.name}`]: e.target.value
                                }))}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleTaskAdd();
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleTaskAdd}
                                sx={{ minWidth: '40px', px: 2 }}
                            >
                                <AddCircleOutlineIcon />
                            </Button>
                        </Box>

                        {/* Task List */}
                        <List dense sx={{
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            mb: 2,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            display: tasks.length === 0 ? 'none' : 'block'
                        }}>
                            {tasks.map((task) => (
                                <ListItem
                                    key={task.id}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" size="small" onClick={() => handleTaskDelete(task.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                    disablePadding
                                >
                                    {isPlanningMode ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, width: '100%' }}>
                                            <Typography variant="body2">{task.text}</Typography>
                                        </Box>
                                    ) : (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={task.done}
                                                    onChange={() => handleTaskToggle(task.id)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        textDecoration: task.done ? 'line-through' : 'none',
                                                        color: task.done ? 'text.disabled' : 'text.primary'
                                                    }}
                                                >
                                                    {task.text}
                                                </Typography>
                                            }
                                            sx={{ ml: 1, width: '100%' }}
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>

                        {/* Manual Override Controls - Hide in Planning Mode */}
                        {!isPlanningMode && (
                            <Box sx={{ mt: 1, p: 1, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={taskData.manualOverride || false}
                                            onChange={(e) => {
                                                const isManual = e.target.checked;
                                                const newCompletion = isManual ? completion : calculateTaskCompletion(tasks);

                                                handleInputChange(level, sectionName, (field.name || field.label), {
                                                    ...taskData,
                                                    manualOverride: isManual,
                                                    completion: newCompletion
                                                });
                                            }}
                                        />
                                    }
                                    label={<Typography variant="caption">Manual Percentage Override</Typography>}
                                />

                                {taskData.manualOverride && (
                                    <Box sx={{ px: 1 }}>
                                        <Slider
                                            value={completion}
                                            onChange={(e, newVal) => handleInputChange(level, sectionName, (field.name || field.label), {
                                                ...taskData,
                                                completion: newVal
                                            })}
                                            valueLabelDisplay="auto"
                                            step={5}
                                            marks
                                            min={0}
                                            max={100}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                );

            case 'percentage':
                // Check if this field is targeted by any previous day's section
                let targetedTasks = null;

                if (level === 'daily' && previousDayData) {
                    // Iterate through yesterday's config/sections to find if any targets this field
                    config.sections.daily.forEach(prevSection => {
                        // Check if section targets this section OR fallback for 'organize' targeting 'performance'
                        if (prevSection.targetSection === section.name || (prevSection.name === 'organize' && section.name === 'performance')) {
                            prevSection.fields.forEach(prevField => {
                                // Check target field name match
                                // User config has: targetFieldName: 'percentage'
                                // Field in this section is named 'completion' (type: percentage)
                                // We match on targetFieldName === field.name OR special case 'percentage' if field type is percentage
                                // Fallback: match if prevField is 'organize' and this field is percentage
                                if (prevField.targetFieldName === field.name ||
                                    (prevField.targetFieldName === 'percentage' && field.type === 'percentage') ||
                                    (prevField.name === 'organize' && field.type === 'percentage')) {
                                    // Found a source!
                                    const srcValue = previousDayData[prevSection.name]?.[prevField.name || prevField.label];
                                    if (srcValue && srcValue.tasks) {
                                        targetedTasks = srcValue.tasks;
                                    }
                                }
                            });
                        }
                    });
                }

                // If targeted tasks found, render Execution View (Checklist) instead of simple Slider
                if (targetedTasks && targetedTasks.length > 0) {

                    const currentVal = value; // This field's value in current form

                    // Determine tasks state to use
                    let activeTasks = [];
                    let activeCompletion = 0;
                    let isManual = false;

                    if (currentVal && typeof currentVal === 'object' && currentVal.tasks) {
                        // We already have state for today
                        activeTasks = currentVal.tasks;
                        activeCompletion = currentVal.completion || 0;
                        isManual = currentVal.manualOverride || false;
                    } else {
                        // Initialize from targeted tasks 
                        // Start fresh (all false)
                        activeTasks = targetedTasks.map(t => ({ ...t, done: false }));
                        // If there is a numeric value already (manual entry before tasks appeared?), keep it or reset to 0?
                        // Reset to 0 implies task driven.
                        activeCompletion = typeof currentVal === 'number' ? currentVal : 0;
                    }

                    const handleExecTaskToggle = (taskId) => {
                        const newTasks = activeTasks.map(t =>
                            t.id === taskId ? { ...t, done: !t.done } : t
                        );

                        // Calculate new percentage
                        const newCompletion = isManual ? activeCompletion : calculateTaskCompletion(newTasks);

                        handleInputChange(level, sectionName, (field.name || field.label), {
                            completion: newCompletion,
                            tasks: newTasks,
                            manualOverride: isManual
                        });
                    };

                    return (
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {getFieldIcon(field.type)}
                                    <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                        {field.label}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                        {activeCompletion}% Done
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ({activeTasks.filter(t => t.done).length}/{activeTasks.length})
                                    </Typography>
                                </Box>
                            </Box>

                            <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                                {activeTasks.map((task) => (
                                    <ListItem key={task.id} disablePadding>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={task.done}
                                                    onChange={() => handleExecTaskToggle(task.id)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{
                                                    textDecoration: task.done ? 'line-through' : 'none',
                                                    color: task.done ? 'text.disabled' : 'text.primary'
                                                }}>
                                                    {task.text}
                                                </Typography>
                                            }
                                            sx={{ ml: 1, width: '100%' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            {/* Manual Override Controls for Execution Mode */}
                            <Box sx={{ mt: 1, p: 1, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={isManual}
                                            onChange={(e) => {
                                                const newIsManual = e.target.checked;
                                                const newCompletion = newIsManual ? activeCompletion : calculateTaskCompletion(activeTasks);

                                                handleInputChange(level, sectionName, (field.name || field.label), {
                                                    completion: newCompletion,
                                                    tasks: activeTasks,
                                                    manualOverride: newIsManual
                                                });
                                            }}
                                        />
                                    }
                                    label={<Typography variant="caption">Manual Percentage Override</Typography>}
                                />

                                {isManual && (
                                    <Box sx={{ px: 1 }}>
                                        <Slider
                                            value={activeCompletion}
                                            onChange={(e, newVal) => handleInputChange(level, sectionName, (field.name || field.label), {
                                                completion: newVal,
                                                tasks: activeTasks,
                                                manualOverride: true
                                            })}
                                            valueLabelDisplay="auto"
                                            step={5}
                                            marks
                                            min={0}
                                            max={100}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
                }

                // Default Percentage View (Slider)
                return (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getFieldIcon(field.type)}
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 0.5 }}>
                                    {field.label}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {typeof value === 'object' ? (value.completion || 0) : (value || 0)}%
                            </Typography>
                        </Box>
                        <Slider
                            value={typeof value === 'object' ? (value.completion || 0) : (Number(value) || 0)}
                            onChange={(e, newVal) => handleInputChange(level, sectionName, (field.name || field.label), newVal)}
                            valueLabelDisplay="auto"
                            step={field.step || 10}
                            marks
                            min={field.min || 0}
                            max={field.max || 100}
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
                // Auto-calculate completion for weekly/monthly/quarterly
                let goalDataToSave = formValues[level];
                if (metrics && metrics.autoCalculateCompletion) {
                    goalDataToSave = metrics.autoCalculateCompletion(level, identifier, formValues[level]);
                }

                await saveGoal(goalDataToSave, user.uid, level, identifier);
                setSavedData((prev) => ({
                    ...prev,
                    [level]: goalDataToSave,
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
                // Auto-calculate completion for weekly/monthly/quarterly
                let goalData = formValues[level];
                if (metrics && metrics.autoCalculateCompletion) {
                    goalData = metrics.autoCalculateCompletion(level, identifier, formValues[level]);
                }

                await saveGoal(goalData, user.uid, level, identifier);
                setSavedData((prev) => ({
                    ...prev,
                    [level]: goalData,
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
            // Clear loaded tabs cache when date changes
            loadedTabs.current.clear();
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

            {/* Compact Navigation Bar - Date Controls + Action Buttons */}
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 2 }}>
                {/* Left: Date Navigation */}
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="outlined" size="small" onClick={() => handlePrevNextClick('prev')} disabled={loading}>
                        Previous
                    </Button>
                    {!isSelectedDateToday() && (
                        <Button variant="contained" size="small" onClick={resetDate} color="secondary">
                            Today
                        </Button>
                    )}
                    <Button variant="outlined" size="small" onClick={() => handlePrevNextClick('next')} disabled={loading || isSelectedDateIsFuture(selectedDate)}>
                        Next
                    </Button>
                </Stack>

                {/* Right: Action Buttons (Edit/Delete or Save/Cancel) */}
                {!loading && (
                    <Stack direction="row" spacing={0.5}>
                        {/* View Mode: Edit & Delete buttons */}
                        {savedData[levels[tabIndex]] && !editMode && (
                            <>
                                <Tooltip title="Edit">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() => handleSubmit('edit')}
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {showDeleteButton() && (
                                    <Tooltip title="Delete">
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleSubmit('delete')}
                                            sx={{
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'error.dark' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </>
                        )}

                        {/* Edit Mode: Save & Cancel buttons */}
                        {editMode && (
                            <>
                                <Tooltip title="Save">
                                    <IconButton
                                        color="success"
                                        size="small"
                                        onClick={() => handleSubmit('save')}
                                        sx={{
                                            bgcolor: 'success.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'success.dark' }
                                        }}
                                    >
                                        <SaveIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleSubmit('cancel')}
                                        sx={{
                                            bgcolor: 'error.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'error.dark' }
                                        }}
                                    >
                                        <CancelIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                    </Stack>
                )}
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <Box>

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
                                        {section.fields.map((field, index) => {
                                            // Check if field should be shown based on conditional logic
                                            if (!shouldShowField(field, section, levels[tabIndex])) {
                                                return null;
                                            }

                                            return (
                                                <Box key={`field-${levels[tabIndex]}-${section.name}-${index}`} sx={{ width: '100%' }}>
                                                    {renderField(field, levels[tabIndex], section.name, index)}
                                                </Box>
                                            );
                                        })}
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
