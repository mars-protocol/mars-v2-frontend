/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '3xs': '3px',
        '2xs': '4px',
        xs: '5px',
        sm: '8px',
        base: '9px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '30px',
        '4xl': '100px',
      },
      boxShadow: {
        inset: 'inset 0px 2px 2px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        accent: '#2c1b2f',
        'accent-dark': '#341a2a',
        'accent-inverted': '#345dff',
        'accent-highlight': '#421f32',
        atom: '#6f7390',
        axlusdc: '#478edc',
        body: '#562a3b',
        'body-dark': '#141621',
        grey: '#3a3c49',
        'grey-dark': '#1a1c25',
        'grey-highlight': '#4c4c4c',
        'grey-light': '#bfbfbf',
        'grey-medium': '#5f697a',
        input: '#282a33',
        loss: '#f96363',
        mars: '#a03b45',
        osmo: '#9f1ab9',
        profit: '#41a4a9',
        primary: '#14a693',
        'primary-highlight': '#15bfa9',
        secondary: '#524bb1',
        'secondary-dark': '#440b37',
        'secondary-highlight': '#6962cc',
        'vote-against': '#eb9e49',
        warning: '#c83333',
      },
      fontFamily: {
        sans: ['Inter'],
      },
      fontSize: {
        xs: ['11.85px', '16px'],
        sm: ['13.33px', '20px'],
        base: ['15px', '20px'],
        lg: ['16.88px', '24px'],
        xl: ['18.98px', '28px'],
        '2xl': ['21.36px', '32px'],
        '3xl': ['24.03px', '36px'],
        '4xl': ['30.42px', '40px'],
        '5xl': ['38.49px', '56px'],
        '6xl': ['60.84px', '80px'],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        semibold: 600,
        bold: 600,
      },
      letterSpacing: {
        normal: 0,
        wide: '2px',
        wider: '3px',
        widest: '5px',
      },
      screens: {
        sm: '480px',
        md: '720px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1920px',
      },
    },
  },
  plugins: [
    require('tailwindcss-border-gradient-radius'),
    plugin(function ({ addBase, addUtilities, theme }) {
      addBase({
        h1: { fontSize: '60.84px', lineHeight: '80px', fontWeight: theme('fontWeight.light') },
        h2: { fontSize: '38.49px', lineHeight: '56px' },
        'h2-caps': {
          fontSize: '38.49px',
          lineHeight: '56px',
          textTransform: 'uppercase',
          letterSpacing: '9px',
        },
        h3: { fontSize: '30.42px', lineHeight: '40px' },
        'h3-caps': { fontSize: '30.42px', lineHeight: '40px', textTransform: 'uppercase' },
        h4: { fontSize: '24.03px', lineHeight: '36px', fontWeight: theme('fontWeight.normal') },
        'h4-caps': {
          fontSize: '24.03px',
          lineHeight: '36px',
          textTransform: 'uppercase',
          letterSpacing: theme('letterSpacing.wider'),
        },
        '3xs': { fontSize: '9,36px', lineHeight: '12px' },
        '3xs-caps': {
          fontSize: '9,36px',
          lineHeight: '12px',
          textTransform: 'uppercase',
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: theme('letterSpacing.wide'),
        },
        '2xs': { fontSize: '10.53px', lineHeight: '16px' },
        '2xs-caps': {
          fontSize: '10.53px',
          lineHeight: '16px',
          textTransform: 'uppercase',
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: theme('letterSpacing.wide'),
        },
        'xs-caps': {
          fontSize: '11.85px',
          lineHeight: '16px',
          textTransform: 'uppercase',
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: theme('letterSpacing.wider'),
        },
        'sm-caps': {
          fontSize: '13.33px',
          lineHeight: '20px',
          textTransform: 'uppercase',
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: theme('letterSpacing.wider'),
        },
        'lg-caps': {
          fontSize: '16.88px',
          lineHeight: '24px',
          textTransform: 'uppercase',
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: theme('letterSpacing.wider'),
        },
        'xl-caps': {
          fontSize: '18.98px',
          lineHeight: '28px',
          textTransform: 'uppercase',
          fontWeight: theme('fontWeight.light'),
          letterSpacing: theme('letterSpacing.widest'),
        },
        '2xl-caps': {
          fontSize: '21.36px',
          lineHeight: '32px',
          textTransform: 'uppercase',
          letterSpacing: theme('letterSpacing.wider'),
        },
      }),
        addUtilities({
          '.gradient-atom': {
            background: 'linear-gradient(to bottom, #2e3148, #6f7390)',
          },
          '.gradient-axlusdc': {
            background: 'linear-gradient(to bottom, #1f5c9e, #478edc)',
          },
          '.gradient-card': {
            background:
              'linear-gradient(99.79deg, rgba(8, 11, 30, 0.79) 8.17%, rgba(52, 20, 33, 0.9) 94.54%)',
          },
          '.gradient-hatched': {
            backgroundImage:
              'linear-gradient(135deg,transparent 33.33%,#826d6b 33.33%,#826d6b 50%,transparent 50%,transparent 83.33%,#826d6b 83.33%,#826d6b 100%)',
            backgroundSize: '5px 5px',
          },
          '.gradient-limit': {
            background:
              'linear-gradient(to right,#15bfa9 20.9%,#5e4bb1 49.68%,#382685 82.55%,#c83333 100%)',
          },
          '.gradient-mars': {
            background: 'linear-gradient(to bottom, #a03b45, #c83333)',
          },
          '.gradient-osmo': {
            background: 'linear-gradient(to bottom, #3a02e2, #e700ca)',
          },
          '.gradient-popover': {
            background: 'linear-gradient(180deg, #fef4ed -2.1%, #ecdbe0 97.53%)',
          },
          '.gradient-tooltip': {
            background:
              'linear-gradient(77.47deg, rgba(20, 24, 57, 0.9) 11.58%, rgba(34, 16, 57, 0.9) 93.89%)',
          },
        })
    }),
  ],
}
