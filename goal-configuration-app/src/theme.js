// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    typography: {
        h1: {
            fontSize: '2rem',
            [`@media (min-width:600px)`]: {
                fontSize: '2.5rem',
            },
            [`@media (min-width:960px)`]: {
                fontSize: '3rem',
            },
        },
        h6: {
            fontSize: '1rem',
            [`@media (min-width:600px)`]: {
                fontSize: '1.25rem',
            },
        },
    },
    spacing: (factor) => `${0.5 * factor}rem`, // Custom spacing
});

export default theme;
