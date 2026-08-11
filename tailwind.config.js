/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#FFF8F0',
                    100: '#FFE8D6',
                    200: '#FFD1AD',
                    300: '#FFBA84',
                    400: '#FFA35B',
                    500: '#FF7A00',
                    600: '#E66E00',
                    700: '#CC6200',
                    800: '#B35600',
                    900: '#994A00',
                },
                cream: '#FFF9F5',
                beige: '#FAF0E6',
                lightGray: '#F5F5F5',
                darkText: '#1A1A1A',
                grayText: '#6B7280',
                green: '#2E7D32',
                gold: '#F59E0B',
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
                'medium': '0 8px 30px rgba(0, 0, 0, 0.08)',
                'large': '0 20px 50px rgba(0, 0, 0, 0.10)',
                'card': '0 4px 15px rgba(255, 122, 0, 0.08)',
            },
        },
    },
    plugins: [],
}