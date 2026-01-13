/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
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
