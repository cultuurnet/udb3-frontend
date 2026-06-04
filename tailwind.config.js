/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw',
  theme: {
    extend: {
      colors: {
        // Brand blues
        'udb-main-blue': 'var(--udb-main-blue)',
        'udb-main-dark-blue': 'var(--udb-main-dark-blue)',
        'udb-main-darkest-blue': 'var(--udb-main-darkest-blue)',
        'udb-main-medium-blue': 'var(--udb-main-medium-blue)',
        'udb-main-light-blue': 'var(--udb-main-light-blue)',
        'udb-blue': 'var(--udb-blue)',
        // Brand reds
        'udb-red': 'var(--udb-red)',
        'udb-red-1': 'var(--udb-red-1)',
        'udb-red-2': 'var(--udb-red-2)',
        'udb-red-3': 'var(--udb-red-3)',
        'udb-red-4': 'var(--udb-red-4)',
        'udb-red-5': 'var(--udb-red-5)',
        // Brand greens
        'udb-main-positive-green': 'var(--udb-main-positive-green)',
        'udb-main-light-green': 'var(--udb-main-light-green)',
        'udb-green-1': 'var(--udb-green-1)',
        'udb-green-2': 'var(--udb-green-2)',
        'udb-green-3': 'var(--udb-green-3)',
        'udb-green-4': 'var(--udb-green-4)',
        'udb-green-5': 'var(--udb-green-5)',
        // Greys
        'udb-main-grey': 'var(--udb-main-grey)',
        'udb-main-darkest-grey': 'var(--udb-main-darkest-grey)',
        'udb-main-dark-grey': 'var(--udb-main-dark-grey)',
        'udb-main-light-grey': 'var(--udb-main-light-grey)',
        'udb-grey-light': 'var(--udb-grey-light)',
        'udb-grey-1': 'var(--udb-grey-1)',
        'udb-grey-2': 'var(--udb-grey-2)',
        'udb-grey-3': 'var(--udb-grey-3)',
        'udb-grey-4': 'var(--udb-grey-4)',
        'udb-grey-5': 'var(--udb-grey-5)',
        'udb-grey-6': 'var(--udb-grey-6)',
        // Pinks
        'udb-pink-1': 'var(--udb-pink-1)',
        'udb-pink-2': 'var(--udb-pink-2)',
        // Other
        'udb-white': 'var(--udb-white)',
        'udb-orange-1': 'var(--udb-orange-1)',
        'udb-text': 'var(--udb-text)',
        'udb-warning': 'var(--udb-warning)',
        'udb-danger': 'var(--udb-danger)',
        'udb-danger-dark': 'var(--udb-danger-dark)',
        'udb-danger-bright': 'var(--udb-danger-bright)',
      },
      borderRadius: {
        udb: 'var(--udb-border-radius)',
      },
    },
  },
};
