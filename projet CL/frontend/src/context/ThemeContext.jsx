import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme';

const ColorModeContext = createContext({ toggleColorMode: () => { } });

export const useColorMode = () => {
    return useContext(ColorModeContext);
};

export const ColorModeProvider = ({ children }) => {
    // Initialize state from localStorage or default to 'dark'
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode ? savedMode : 'dark'; // Default to dark as per original design
    });

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', newMode);
                    return newMode;
                });
            },
            mode,
        }),
        [mode],
    );

    const theme = useMemo(() => createTheme(getTheme(mode)), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};
