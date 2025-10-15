/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.{pug,html,js}", // for Pug/HTML templates
    "./public/**/*.{html,js}",    // if you have any static JS/HTML in public
  ],
  darkMode: "class", // allows switching between light/dark mode via class
  theme: {
    extend: {
      colors: {
        primary: "#1173d4",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
      },
      fontFamily: {
        display: ["Public Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
