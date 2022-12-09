/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src//components/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'h-15',
    'text-3xs',
    'text-3xs-caps',
    'text-2xs',
    'text-2xs-caps',
    'text-xs-caps',
    'text-xs',
    'text-sm-caps',
    'text-sm',
    'text-base-caps',
    'text-base',
    'text-lg-caps',
    'text-lg',
    'text-xl-caps',
    'text-xl',
    'text-2xl-caps',
    'text-2xl',
    'text-3xl-caps',
    'text-3xl',
    'text-4xl-caps',
    'text-4xl',
    'text-5xl-caps',
    'text-5xl',
    'w-15',
  ],
  theme: {
    extend: {
      animation: {
        progress: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        fadein: 'fadein 1s ease-in-out forwards',
      },
      backgroundImage: {
        mars: 'url(/images/bg.svg)',
        'fund-modal': 'url(/images/fund-modal-bg.png)',
      },
      backgroundSize: {
        desktop: '100% auto',
      },
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
        overlay: '0 2px 2px rgba(0, 0, 0, 0.14), 0 1px 5px rgba(0, 0, 0, 0.2)',
        tooltip:
          '0 3px 4px rgba(0, 0, 0, 0.14), 0 3px 3px rgba(0, 0, 0, 0.12), 0 1px 8px rgba(0, 0, 0, 0.2)',
      },
      brightness: {
        30: '.3',
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
        header: 'rgba(59, 25, 40, 0.4);',
        input: '#282a33',
        loss: '#f96363',
        mars: '#a03b45',
        osmo: '#9f1ab9',
        profit: '#41a4a9',
        primary: '#14a693',
        'primary-highlight': '#15bfa9',
        'primary-highlight-10': '#20e7cd',
        secondary: '#524bb1',
        'secondary-dark': '#440b37',
        'secondary-dark-10': '#70125b',
        'secondary-highlight': '#6962cc',
        'secondary-highlight-10': '#8e88d9',
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
      height: {
        15: '60px',
      },
      hueRotate: {
        '-82': '-82deg',
      },
      keyframes: {
        fadein: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
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
      transitionDuration: {
        3000: '3000ms',
      },
      transitionProperty: {
        background: 'filter, -webkit-filter',
      },
      width: {
        15: '60px',
      },
    },
  },
  plugins: [
    require('tailwindcss-border-gradient-radius'),
    plugin(function ({ addBase, addUtilities, theme }) {
      addBase({
        h1: { fontSize: '60.84px', lineHeight: '80px', fontWeight: theme('fontWeight.light') },
        h2: { fontSize: '38.49px', lineHeight: '56px' },
        h3: { fontSize: '30.42px', lineHeight: '40px' },
        h4: { fontSize: '24.03px', lineHeight: '36px', fontWeight: theme('fontWeight.normal') },
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
          '.text-3xs': { fontSize: '9.36px', lineHeight: '12px' },
          '.text-3xs-caps': {
            fontSize: '9.36px',
            lineHeight: '12px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wide'),
          },
          '.text-2xs': { fontSize: '10.53px', lineHeight: '16px' },
          '.text-2xs-caps': {
            fontSize: '10.53px',
            lineHeight: '16px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wide'),
          },
          '.text-xs-caps': {
            fontSize: '11.85px',
            lineHeight: '16px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-sm-caps': {
            fontSize: '13.33px',
            lineHeight: '20px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-base-caps': {
            fontSize: '15px',
            lineHeight: '20px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-lg-caps': {
            fontSize: '16.88px',
            lineHeight: '24px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-xl-caps': {
            fontSize: '18.98px',
            lineHeight: '28px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.light'),
            letterSpacing: theme('letterSpacing.widest'),
          },
          '.text-2xl-caps': {
            fontSize: '21.36px',
            lineHeight: '32px',
            textTransform: 'uppercase',
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-3xl-caps': {
            fontSize: '24.03px',
            lineHeight: '36px',
            textTransform: 'uppercase',
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-4xl-caps': { fontSize: '30.42px', lineHeight: '40px', textTransform: 'uppercase' },
          '.text-5xl-caps': {
            fontSize: '38.49px',
            lineHeight: '56px',
            textTransform: 'uppercase',
            letterSpacing: '9px',
          },
        })
    }),
  ],
}
