
export const getTheme = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light Mode Palette
                primary: {
                    main: '#667eea',
                    light: '#764ba2',
                    dark: '#5a67d8',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#d53f8c',
                    light: '#f687b3',
                    dark: '#b83280',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f4f6f8', // Light Grey
                    paper: '#ffffff',   // White
                    card: '#ffffff',
                },
                text: {
                    primary: '#2d3748', // Dark Grey
                    secondary: '#3d65a2ff', // Medium Grey
                },
                action: {
                    hover: 'rgba(0, 0, 0, 0.04)',
                },
            }
            : {
                // Dark Mode Palette (Original)
                primary: {
                    main: '#667eea',
                    light: '#764ba2',
                    dark: '#5a67d8',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#d53f8c',
                    light: '#f687b3',
                    dark: '#b83280',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#020c1b', // Very Deep Navy (Darker)
                    paper: '#0a192f',   // Deep Navy (Darker)
                    card: '#112240',    // Light Navy (Darker)
                },
                text: {
                    primary: '#e6f1ff', // Off-white
                    secondary: '#8892b0', // Slate
                },
                action: {
                    hover: 'rgba(100, 255, 218, 0.07)',
                },
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: mode === 'dark' ? "#6b6b6b #2b2b2b" : "#c1c1c1 #f1f1f1",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: mode === 'dark' ? "#2b2b2b" : "#f1f1f1",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: mode === 'dark' ? "#6b6b6b" : "#c1c1c1",
                        minHeight: 24,
                        border: mode === 'dark' ? "3px solid #2b2b2b" : "3px solid #f1f1f1",
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: mode === 'dark' ? "#959595" : "#a8a8a8",
                    },
                    "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                        backgroundColor: mode === 'dark' ? "#959595" : "#a8a8a8",
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: mode === 'dark' ? "#959595" : "#a8a8a8",
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: mode === 'dark' ? "#2b2b2b" : "#f1f1f1",
                    },
                },
                "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active": {
                    WebkitBoxShadow: mode === 'dark' ? "0 0 0 30px #112240 inset !important" : "0 0 0 30px #ffffff inset !important",
                    WebkitTextFillColor: mode === 'dark' ? "#e6f1ff !important" : "#2d3748 !important",
                    caretColor: mode === 'dark' ? "#e6f1ff" : "#2d3748",
                    borderRadius: "inherit",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '50px',
                    padding: '10px 24px',
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 14px 0 rgba(118, 75, 162, 0.39)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(118, 75, 162, 0.23)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: mode === 'dark' ? '#112240' : '#ffffff',
                    backgroundImage: 'none',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '20px', // Smoother, rounder corners
                        transition: 'all 0.3s ease-in-out',
                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        '& fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.23)',
                            transition: 'border-color 0.3s ease-in-out',
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            borderWidth: '2px', // Slightly thicker focus ring for clarity
                        },
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});
