// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,      // Mobile phones (0px - 599px)
            sm: 600,    // Tablets (600px - 959px)
            md: 960,    // Tablets landscape (960px - 1279px)
            lg: 1280,   // Small laptops (1280px - 1919px)
            xl: 1920,   // Desktops (1920px+)
        },
    },
    typography: {
        h1: {
            fontSize: '1.5rem', // Mobile first
            [`@media (min-width:600px)`]: {
                fontSize: '2rem',
            },
            [`@media (min-width:960px)`]: {
                fontSize: '2.5rem',
            },
            [`@media (min-width:1280px)`]: {
                fontSize: '3rem',
            },
        },
        h5: {
            fontSize: '1.2rem', // Mobile first
            [`@media (min-width:600px)`]: {
                fontSize: '1.5rem',
            },
        },
        h6: {
            fontSize: '0.9rem', // Mobile first
            [`@media (min-width:600px)`]: {
                fontSize: '1rem',
            },
            [`@media (min-width:960px)`]: {
                fontSize: '1.25rem',
            },
        },
        body1: {
            fontSize: '0.9rem', // Mobile first
            [`@media (min-width:600px)`]: {
                fontSize: '1rem',
            },
        },
        body2: {
            fontSize: '0.85rem', // Mobile first
            [`@media (min-width:600px)`]: {
                fontSize: '0.875rem',
            },
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: '44px', // Touch-friendly (min 44px)
                    minWidth: '44px',
                },
                sizeMedium: {
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    [`@media (min-width:600px)`]: {
                        padding: '10px 24px',
                        fontSize: '1rem',
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    padding: '8px',
                    minHeight: '44px',
                    minWidth: '44px',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& input': {
                        fontSize: '1rem', // Prevent zoom on iOS
                    },
                },
            },
        },
        MuiInput: {
            styleOverrides: {
                root: {
                    fontSize: '1rem', // Prevent zoom on iOS
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    [`@media (min-width:600px)`]: {
                        borderRadius: '12px',
                    },
                },
            },
        },
    },
    spacing: (factor) => `${0.5 * factor}rem`, // Custom spacing
});

export default theme;
