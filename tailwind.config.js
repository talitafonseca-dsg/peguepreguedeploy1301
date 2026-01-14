/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                'quicksand': ['Quicksand', 'sans-serif'],
                'nunito': ['Nunito', 'sans-serif'],
            },
            colors: {
                purple: {
                    DEFAULT: '#7c3aed',
                }
            }
        },
    },
    plugins: [],
}
