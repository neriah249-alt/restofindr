import { useTheme } from '../context/ThemeContext';

export const useThemeColors = () => {
    const { isDark } = useTheme();

    return {
        bg: isDark ? 'bg-gray-800' : 'bg-white',
        bgCard: isDark ? 'bg-gray-800' : 'bg-white',
        bgInput: isDark ? 'bg-gray-700' : 'bg-gray-50',
        text: isDark ? 'text-white' : 'text-darkText',
        textSecondary: isDark ? 'text-gray-400' : 'text-gray-500',
        textMuted: isDark ? 'text-gray-500' : 'text-gray-400',
        border: isDark ? 'border-gray-700' : 'border-gray-200',
        shadow: isDark ? 'shadow-2xl' : 'shadow-2xl',
        input: isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700',
    };
};