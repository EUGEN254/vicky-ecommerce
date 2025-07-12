/** @type {import('tailwindcss').Config} */

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Make sure to include your source files
    ],
    theme: {
      extend: {
        animation: {
          fade: "fadeIn 1.5s ease-in-out",
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        },
      },
    },
    plugins: [],
  }
  