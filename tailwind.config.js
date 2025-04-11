/** @type {import('tailwindcss').Config} */
//const withMT = require("@material-tailwind/react/utils/withMT");
// https://www.tutorialrepublic.com/html-reference/html-color-picker.php

module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        midnight: '#343c4d',
        soot: '#212121',
        soft: '#757575',
        lightGray: '#CECECE',
        
        'btn-primary': '#508DC8',
        'btn-primary-shadow': '#4070a0',
      }
    },

  },
  plugins: [],
}

