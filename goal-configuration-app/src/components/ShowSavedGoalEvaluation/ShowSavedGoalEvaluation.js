import React from "react";
import {
    Typography,
    Box,
    Paper,
    Stack,
    LinearProgress,
    Rating,
    Chip,
    Switch,
    FormControlLabel
} from "@mui/material";
import {
    Timer as TimerIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from "@mui/icons-material";
import GenericLogic from "../../common/utils/generic-logic";
import CONSTANTS from "../../common/constants";

const ShowSavedGoalEvaluation = ({ savedData, config, level }) => {
    const renderFieldValue = (field, value) => {
        if (!value && value !== 0) {
            return (
                <Typography
                    variant="body2"
                    sx={{
                        fontStyle: 'italic',
                        color: 'text.disabled'
                    }}
                >
                    No saved value
                </Typography>
            );
        }

        // Percentage field - show as progress bar
        if (field.type === 'percentage') {
            const percentage = Number(value) || 0;
            const color = percentage >= 70 ? 'success.main' :
                percentage >= 40 ? 'warning.main' : 'error.main';

            return (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h5" color="primary.main" fontWeight="bold">
                            {percentage}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                            height: 10,
                            borderRadius: 1,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: color,
                                borderRadius: 1
                            }
                        }}
                    />
                </Box>
            );
        }

        // Rating field - show as stars
        if (field.type === 'rating') {
            const rating = Number(value) || 0;
            const maxRating = 10;

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                        value={rating}
                        max={maxRating}
                        readOnly
                        size="large"
                        precision={1}
                        sx={{
                            color: 'warning.main',
                            '& .MuiRating-iconEmpty': {
                                color: 'grey.300'
                            }
                        }}
                    />
                    <Typography variant="h6" color="text.secondary" fontWeight="600">
                        {rating}/{maxRating}
                    </Typography>
                </Box>
            );
        }

        // Number field - show as plain number
        if (field.type === 'number') {
            return (
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {value}
                </Typography>
            );
        }

        // Duration field - show as time badge
        if (field.type === 'duration' || field.type === 'time') {
            const totalMinutes = Number(value) || 0;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const timeString = hours > 0
                ? `${hours}h ${minutes}m`
                : `${minutes}m`;

            return (
                <Chip
                    icon={<TimerIcon />}
                    label={timeString}
                    color="primary"
                    variant="outlined"
                    size="medium"
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        py: 2.5
                    }}
                />
            );
        }

        // Boolean field - display as Switch (read-only)
        if (field.type === 'boolean') {
            const boolValue = Array.isArray(value)
                ? (value.length > 0 && value[0])
                : value;

            const trueLabel = field.options && field.options.length >= 2 ? field.options[0] : 'Yes';
            const falseLabel = field.options && field.options.length >= 2 ? field.options[1] : 'No';

            const isCheckedBool = field.options && field.options.length >= 2
                ? (boolValue === field.options[0] || boolValue === true)
                : (boolValue === 'Yes' || boolValue === true);

            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                    }}
                >
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isCheckedBool}
                                disabled
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
        }

        // Checkbox field - show as Yes/No chip
        if (field.type === 'checkbox') {
            const isChecked = Array.isArray(value) ? value.includes('Yes') : value === 'Yes';

            return (
                <Chip
                    icon={isChecked ? <CheckCircleIcon /> : <CancelIcon />}
                    label={isChecked ? 'Yes' : 'No'}
                    color={isChecked ? 'success' : 'error'}
                    variant="outlined"
                    size="medium"
                    sx={{ fontWeight: 600 }}
                />
            );
        }

        // Text field - show in bordered paper
        if (field.type === 'text') {
            return (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderLeft: '3px solid',
                        borderColor: 'primary.light'
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            whiteSpace: 'pre-wrap',
                            color: 'text.primary'
                        }}
                    >
                        {value}
                    </Typography>
                </Paper>
            );
        }

        // Default - render as is
        if (Array.isArray(value)) {
            return (
                <Typography variant="body2" color="text.secondary">
                    {value.join(", ")}
                </Typography>
            );
        }

        return (
            <Typography variant="body2" color="text.secondary">
                {value}
            </Typography>
        );
    };

    return (
        <Box sx={{ width: '100%' }}>
            {config.map((section, sectionIndex) => (
                <Paper
                    key={`saved-section-${sectionIndex}`}
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
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}
                        >
                            {section?.label || section?.name}
                        </Typography>
                    </Box>

                    {/* Fields in Stack */}
                    <Stack spacing={2}>
                        {section?.fields?.map((field, fieldIndex) => {
                            const value = savedData[section.name] && (savedData[section.name][field.name] || savedData[section.name][field.label]);

                            return (
                                <Box
                                    key={`saved-field-${sectionIndex}-${fieldIndex}`}
                                    sx={{ width: '100%' }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.primary',
                                            mb: 1
                                        }}
                                    >
                                        {field.label}
                                    </Typography>
                                    {renderFieldValue(field, value)}
                                </Box>
                            );
                        })}
                    </Stack>
                </Paper>
            ))}
        </Box>
    );
};

export default ShowSavedGoalEvaluation;