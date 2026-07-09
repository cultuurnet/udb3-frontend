/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw',
  theme: {
    extend: {
      boxShadow: {
        heavy: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
