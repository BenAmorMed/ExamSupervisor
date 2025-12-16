import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

// Custom font configuration (optional, using system fonts for now)
const fontConfig = {
    fontFamily: 'System',
};

const lightColors = {
    primary: '#667eea',
    onPrimary: '#ffffff',
    secondary: '#d53f8c',
    onSecondary: '#ffffff',
    background: '#f4f6f8',
    onBackground: '#2d3748',
    surface: '#ffffff',
    onSurface: '#2d3748',
    error: '#B00020',
    onError: '#ffffff',
    elevation: {
        level0: 'transparent',
        level1: '#f5f5f5',
        level2: '#eeeeee',
        level3: '#e0e0e0',
        level4: '#d6d6d6',
        level5: '#cccccc',
    },
    // Custom properties to match web theme
    card: '#ffffff',
    textSecondary: '#3d65a2ff',
    success: '#4caf50',
};

const darkColors = {
    primary: '#667eea',
    onPrimary: '#ffffff',
    secondary: '#d53f8c',
    onSecondary: '#ffffff',
    background: '#020c1b', // Very Deep Navy
    onBackground: '#e6f1ff',
    surface: '#0a192f', // Deep Navy (Paper)
    onSurface: '#e6f1ff',
    error: '#CF6679',
    onError: '#000000',
    elevation: {
        level0: 'transparent',
        level1: '#112240', // Light Navy (Card)
        level2: '#1a2e4d',
        level3: '#233a5a',
        level4: '#2c4667',
        level5: '#355274',
    },
    // Custom
    card: '#112240',
    textSecondary: '#8892b0',
    success: '#66bb6a',
};

export const CustomLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...lightColors,
    },
};

export const CustomDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...darkColors,
    },
};
