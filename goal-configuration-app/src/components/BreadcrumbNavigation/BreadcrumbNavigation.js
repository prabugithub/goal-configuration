import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Chip } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const BreadcrumbNavigation = ({ selectedDate, currentLevel, onLevelChange, levels, savedData = {} }) => {

    // Determine which levels are accessible
    const getAccessibleLevels = () => {
        let lastSavedIndex = -1;

        // Find the last saved level
        for (let i = 0; i < levels.length; i++) {
            if (savedData[levels[i]]) {
                lastSavedIndex = i;
            } else {
                break; // Stop at first unsaved level
            }
        }

        // Return indices: all saved levels + the next level (if exists)
        const accessibleIndices = [];
        for (let i = 0; i <= lastSavedIndex; i++) {
            accessibleIndices.push(i);
        }
        // Add next level if it exists
        if (lastSavedIndex + 1 < levels.length) {
            accessibleIndices.push(lastSavedIndex + 1);
        }

        return accessibleIndices;
    };

    const accessibleLevels = getAccessibleLevels();

    // Check if a level is saved
    const isLevelSaved = (level) => {
        return !!savedData[level];
    };

    // Check if a level is accessible (clickable)
    const isLevelAccessible = (levelIndex) => {
        return accessibleLevels.includes(levelIndex);
    };

    // Get display text for each level based on selected date
    const getBreadcrumbText = (level, date) => {
        const d = new Date(date);

        switch (level) {
            case 'yearly':
                return `${d.getFullYear()}`;
            case 'quarterly':
                const quarter = Math.ceil((d.getMonth() + 1) / 3);
                return `Q${quarter}`;
            case 'monthly':
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[d.getMonth()];
            case 'weekly':
                // Get week number of the month
                const weekOfMonth = Math.ceil(d.getDate() / 7);
                // Get ISO week number
                const oneJan = new Date(d.getFullYear(), 0, 1);
                const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
                const weekNumber = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
                return `Week ${weekNumber}`;
            case 'daily':
                return 'Today';
            default:
                return level;
        }
    };

    // Get level index
    const getLevelIndex = (level) => levels.indexOf(level);

    // Handle breadcrumb click
    const handleBreadcrumbClick = (level) => {
        const levelIndex = getLevelIndex(level);
        onLevelChange(null, levelIndex);
    };

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                py: 1.5,
                px: 2,
                mb: 2,
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="goal hierarchy navigation"
                sx={{
                    '& .MuiBreadcrumbs-separator': {
                        mx: 0.5,
                    },
                }}
            >
                {levels.map((level, index) => {
                    const isActive = level === currentLevel;
                    const isSaved = isLevelSaved(level);
                    const isAccessible = isLevelAccessible(index);
                    const text = getBreadcrumbText(level, selectedDate);

                    // Current active level
                    if (isActive) {
                        return (
                            <Chip
                                key={level}
                                label={text}
                                color="primary"
                                size="small"
                                icon={isSaved ? <CheckCircleIcon /> : undefined}
                                sx={{
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }}
                            />
                        );
                    }

                    // Saved levels (clickable)
                    if (isSaved) {
                        return (
                            <Link
                                key={level}
                                component="button"
                                variant="body2"
                                onClick={() => handleBreadcrumbClick(level)}
                                sx={{
                                    textDecoration: 'none',
                                    color: 'success.main',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': {
                                        textDecoration: 'underline',
                                        color: 'success.dark',
                                    },
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />}
                                <CheckCircleIcon sx={{ mr: 0.5, fontSize: 16 }} />
                                {text}
                            </Link>
                        );
                    }

                    // Next available level (clickable but not saved)
                    if (isAccessible) {
                        return (
                            <Link
                                key={level}
                                component="button"
                                variant="body2"
                                onClick={() => handleBreadcrumbClick(level)}
                                sx={{
                                    textDecoration: 'none',
                                    color: 'text.primary',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    '&:hover': {
                                        textDecoration: 'underline',
                                        color: 'primary.main',
                                    },
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {text}
                            </Link>
                        );
                    }

                    // Future levels (not accessible)
                    return (
                        <Typography
                            key={level}
                            color="text.disabled"
                            variant="body2"
                            sx={{
                                fontSize: '0.875rem',
                                opacity: 0.4,
                                cursor: 'not-allowed',
                            }}
                        >
                            {text}
                        </Typography>
                    );
                })}
            </Breadcrumbs>

            {/* Optional: Show full date for context */}
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}
            >
                {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
            </Typography>
        </Box>
    );
};

export default BreadcrumbNavigation;
