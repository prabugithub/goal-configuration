import React from "react";
import { Typography, Box, Paper, Stack } from "@mui/material";
import GenericLogic from "../../common/utils/generic-logic";
import CONSTANTS from "../../common/constants";

const ShowSavedGoalEvaluation = ({ savedData, config, level }) => {
    const renderValue = (value) => {
        if (Array.isArray(value)) {
            return value.join(", ");
        }
        // If the value is a string or other primitive type, render it as plain text
        return value;
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
                            const hasValue = value && value !== '';

                            return (
                                <Box
                                    key={`saved-field-${sectionIndex}-${fieldIndex}`}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: 'grey.50',
                                        borderRadius: 1,
                                        borderLeft: '3px solid',
                                        borderColor: hasValue ? 'success.light' : 'grey.300'
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.primary',
                                            mb: 0.5
                                        }}
                                    >
                                        {field.label}
                                    </Typography>
                                    {hasValue ? (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                whiteSpace: 'pre-line',
                                                color: 'text.secondary'
                                            }}
                                        >
                                            {renderValue(value)}
                                        </Typography>
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontStyle: 'italic',
                                                color: 'text.disabled'
                                            }}
                                        >
                                            No saved value
                                        </Typography>
                                    )}
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