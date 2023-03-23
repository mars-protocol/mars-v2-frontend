/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'h-2',
    'h-4.5',
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
    'w-2',
    'w-4.5',
    'w-15',
  ],
  theme: {
    extend: {
      animation: {
        fadein: 'fadein 1s ease-in-out forwards',
        glow: 'glow 1000ms ease-in-out forwards',
        progress: 'spin 1200ms cubic-bezier(0.5, 0, 0.5, 1) infinite',
      },
      backdropBlur: {
        sticky: '50px',
      },
      backgroundImage: {
        'create-account': 'url(/images/create-account.webp), url(/images/create-account.png)',
        'fund-modal': 'url(/images/fund-bg.webp), url(/images/fund-bg.png)',
        'delete-modal': 'url(/images/delete-account-bg.webp), url(/images/delete-account-bg.png)',
      },
      backgroundSize: {
        desktop: '100% auto',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        base: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '30px',
        '4xl': '100px',
      },
      boxShadow: {
        inset: 'inset 0px 2px 2px rgba(0, 0, 0, 0.25)',
        overlay: '0 2px 2px rgba(0, 0, 0, 0.14), 0 1px 5px rgba(0, 0, 0, 0.2)',
        button: '0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.2)',
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
        body: '#0D0012',
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
        'martian-red': '#FF645F',
        osmo: '#9f1ab9',
        'orb-primary': '#b12f25',
        'orb-secondary': '#530781',
        'orb-tertiary': '#ff00c7',
        profit: '#41a4a9',
        primary: '#FF625E',
        secondary: '#FB9562',
        'vote-against': '#eb9e49',
        warning: '#c83333',
        white: '#FFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '16px'],
        xs: ['12px', '16px'],
        sm: ['14px', '18px'],
        base: ['15px', '20px'],
        lg: ['17px', '24px'],
        xl: ['19px', '28px'],
        '2xl': ['21px', '32px'],
        '3xl': ['24px', '36px'],
        '4xl': ['30px', '40px'],
        '5xl': ['39px', '56px'],
        '6xl': ['61px', '80px'],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        semibold: 500,
        bold: 600,
      },
      height: {
        4.5: '18px',
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
        float: {
          '0%': { transform: 'translate(0%, 0%)' },
          '50%': { transform: 'translate(50%, 50%)' },
          '100%': { transform: 'translate(0%, 0%)' },
        },
        glow: {
          '0%': { opacity: 0 },
          '33%': { opacity: 1 },
          '66%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
      letterSpacing: {
        normal: 0,
        wide: '2px',
        wider: '3px',
        widest: '5px',
      },
      maxWidth: {
        content: '1024px',
      },
      screens: {
        sm: '480px',
        md: '720px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1920px',
      },
      spacing: {
        35: '140px',
      },
      transitionDuration: {
        3000: '3000ms',
        120000: '120000ms',
        150000: '150000ms',
        180000: '180000ms',
      },
      transitionProperty: {
        background: 'filter, -webkit-filter',
      },
      width: {
        4.5: '18px',
        15: '60px',
        30: '120px',
        35: '140px',
        50: '200px',
      },
      zIndex: {
        1: '1',
        2: '2',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    plugin(function ({ addBase, addUtilities, theme }) {
      addBase({
        h1: { fontSize: '61px', lineHeight: '80px', fontWeight: theme('fontWeight.light') },
        h2: { fontSize: '9px', lineHeight: '56px' },
        h3: { fontSize: '30px', lineHeight: '40px' },
        h4: { fontSize: '24px', lineHeight: '36px', fontWeight: theme('fontWeight.normal') },
      }),
        addUtilities({
          '.blur-orb-primary': {
            filter: 'blur(clamp(50px, 8vw, 100px))',
          },
          '.blur-orb-secondary': {
            filter: 'blur(clamp(60px, 20vw, 140px))',
          },
          '.blur-orb-tertiary': {
            filter: 'blur(clamp(60px, 10vw, 110px))',
          },
          '.border-glas': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            '-webkit-mask-composite': 'xor',
            maskComposite: 'exclude',
          },
          '.glow-line': {
            x: 0,
            y: 0,
            fill: 'transparent',
            stroke: '#FFF',
            strokeWidth: '0.5',
            strokeDasharray: '20px 30px',
          },
          '.glow-hover': {
            strokeDashoffset: '-80px',
            transition: 'stroke-dashoffset 1000ms ease-in',
          },
          '.gradient-atom': {
            background: 'linear-gradient(to bottom, #2e3148, #6f7390)',
          },
          '.gradient-axlusdc': {
            background: 'linear-gradient(to bottom, #1f5c9e, #478edc)',
          },
          '.gradient-card': {
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          },
          '.gradient-hatched': {
            backgroundImage:
              'linear-gradient(135deg,transparent 33.33%,#826d6b 33.33%,#826d6b 50%,transparent 50%,transparent 83.33%,#826d6b 83.33%,#826d6b 100%)',
            backgroundSize: '5px 5px',
          },
          '.gradient-header': {
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%)',
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
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
          },
          '.gradient-primary-to-secondary': {
            background: 'linear-gradient(90deg, #FF625E 0%, #FB9562 100%)',
          },
          '.gradient-secondary-to-primary': {
            background: 'linear-gradient(90deg, #FB9562 0%, #FF625E 100%)',
          },
          '.gradient-tooltip': {
            background:
              'linear-gradient(77.47deg, rgba(20, 24, 57, 0.9) 11.58%, rgba(34, 16, 57, 0.9) 93.89%)',
          },
          '.number': {
            whiteSpace: 'nowrap',
            fontFeatureSettings: '"tnum" on',
          },
          '.text-3xs': { fontSize: '9px', lineHeight: '12px' },
          '.text-3xs-caps': {
            fontSize: '9px',
            lineHeight: '12px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wide'),
          },
          '.text-2xs': { fontSize: '10px', lineHeight: '16px' },
          '.text-2xs-caps': {
            fontSize: '10px',
            lineHeight: '16px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wide'),
          },
          '.text-xs-caps': {
            fontSize: '12px',
            lineHeight: '16px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-sm-caps': {
            fontSize: '14px',
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
            fontSize: '17px',
            lineHeight: '24px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.semibold'),
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-xl-caps': {
            fontSize: '19px',
            lineHeight: '28px',
            textTransform: 'uppercase',
            fontWeight: theme('fontWeight.light'),
            letterSpacing: theme('letterSpacing.widest'),
          },
          '.text-2xl-caps': {
            fontSize: '21px',
            lineHeight: '32px',
            textTransform: 'uppercase',
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-3xl-caps': {
            fontSize: '24px',
            lineHeight: '36px',
            textTransform: 'uppercase',
            letterSpacing: theme('letterSpacing.wider'),
          },
          '.text-4xl-caps': { fontSize: '30px', lineHeight: '40px', textTransform: 'uppercase' },
          '.text-5xl-caps': {
            fontSize: '39px',
            lineHeight: '56px',
            textTransform: 'uppercase',
            letterSpacing: '9px',
          },
        })
    }),
  ],
}
