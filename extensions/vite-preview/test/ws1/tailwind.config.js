const path = require('path');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,svelte,vue,html}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

