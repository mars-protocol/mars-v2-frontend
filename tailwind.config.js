/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'border-error',
    'border-success',
    'h-2',
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
    'text-yellow-300',
    'text-violet-500',
    'text-grey-light',
    'fill-yellow-300',
    'fill-violet-500',
    'fill-martian-red',
    'fill-grey-light',
    'w-2',
    '@nav-0/navigation:inline-block',
    '@nav-1/navigation:inline-block',
    '@nav-2/navigation:inline-block',
    '@nav-3/navigation:inline-block',
    '@nav-4/navigation:inline-block',
    '@nav-5/navigation:inline-block',
    '@nav-6/navigation:inline-block',
    '@nav-0/navigation:hidden',
    '@nav-1/navigation:hidden',
    '@nav-2/navigation:hidden',
    '@nav-3/navigation:hidden',
    '@nav-4/navigation:hidden',
    '@nav-5/navigation:hidden',
    '@nav-6/navigation:hidden',
    'bg-slider-1',
    'bg-slider-2',
    'bg-slider-3',
    'bg-slider-4',
    'bg-slider-5',
    'bg-slider-6',
    'bg-slider-7',
    'bg-slider-8',
    'gradient-droplets',
    'gradient-stride',
    'gradient-lido',
    'gradient-milkyway',
    'droplets',
    'stride',
    'lido',
    'milkyway',
  ],
  theme: {
    extend: {
      animation: {
        check: 'check 1.5s ease-in-out forwards',
        circle: 'circle 1.5s ease-in-out forwards',
        fadein: 'fadein 1s ease-in-out forwards',
        glow: 'glow 1000ms ease-in-out forwards',
        progress: 'spin 1200ms cubic-bezier(0.5, 0, 0.5, 1) infinite',
        loaderFade: 'fadein 2s ease-in-out forwards',
        loaderGlow: 'vector 3s ease-in-out forwards',
      },
      backdropBlur: {
        sticky: '50px',
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
        inset: 'inset 0px 2px 2px hsl(var(--color-black) /0.25)',
        overlay: '0 2px 2px hsl(var(--color-black) /0.14), 0 1px 5px hsl(var(--color-black) /0.2)',
        button:
          '0px 1px 1px hsl(var(--color-black) /0.14), 0px 1px 3px hsl(var(--color-black) /0.2)',
        tooltip:
          '0 3px 4px hsl(var(--color-black) /0.04), 0 3px 3px hsl(var(--color-black) /0.04), 0 1px 8px hsl(var(--color-black) /0.04)',
      },
      brightness: {
        30: '.3',
      },
      colors: {
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        'accent-dark': 'hsl(var(--color-accent-dark) / <alpha-value>)',
        'accent-inverted': 'hsl(var(--color-accent-inverted) / <alpha-value>)',
        'accent-highlight': 'hsl(var(--color-accent-highlight) / <alpha-value>)',
        body: 'hsl(var(--color-body) / <alpha-value>)',
        'body-hls': 'hsl(var(--color-body-hls) / <alpha-value>)',
        'body-dark': 'hsl(var(--color-body-dark) / <alpha-value>)',
        chart: 'hsl(var(--color-chart) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
        'error-bg': 'hsl(var(--color-error-bg) / <alpha-value>)',
        fuchsia: 'hsl(var(--color-fuchsia) / <alpha-value>)',
        green: 'hsl(var(--color-green) / <alpha-value>)',
        grey: 'hsl(var(--color-grey) / <alpha-value>)',
        'grey-dark': 'hsl(var(--color-grey-dark) / <alpha-value>)',
        'grey-highlight': 'hsl(var(--color-grey-highlight) / <alpha-value>)',
        'grey-light': 'hsl(var(--color-grey-light) / <alpha-value>)',
        'grey-medium': 'hsl(var(--color-grey-medium) / <alpha-value>)',
        info: 'hsl(var(--color-info) / <alpha-value>)',
        'info-bg': 'hsl(var(--color-info-bg) / <alpha-value>)',
        input: 'hsl(var(--color-input) / <alpha-value>)',
        loss: 'hsl(var(--color-loss) / <alpha-value>)',
        mars: 'hsl(var(--color-mars) / <alpha-value>)',
        'martian-red': 'hsl(var(--color-martian-red) / <alpha-value>)',
        'orb-primary': 'hsl(var(--color-orb-primary) / <alpha-value>)',
        'orb-primary-hls': 'hsl(var(--color-orb-primary-hls) / <alpha-value>)',
        'orb-secondary': 'hsl(var(--color-orb-secondary) / <alpha-value>)',
        'orb-secondary-hls': 'hsl(var(--color-orb-secondary-hls) / <alpha-value>)',
        'orb-tertiary': 'hsl(var(--color-orb-tertiary) / <alpha-value>)',
        'orb-tertiary-hls': 'hsl(var(--color-orb-tertiary-hls) / <alpha-value>)',
        profit: 'hsl(var(--color-profit) / <alpha-value>)',
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        purple: 'hsl(var(--color-purple) / <alpha-value>)',
        'purple-dark': 'hsl(var(--color-purple-dark) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        success: 'hsl(var(--color-success) / <alpha-value>)',
        'success-bg': 'hsl(var(--color-success-bg) / <alpha-value>)',
        'vote-against': 'hsl(var(--color-vote-against) / <alpha-value>)',
        warning: 'hsl(var(--color-warning) / <alpha-value>)',
        'warning-bg': 'hsl(var(--color-warning-bg) / <alpha-value>)',
        white: 'hsl(var(--color-white) / <alpha-value>)',
        pink: 'hsl(var(--color-pink) / <alpha-value>)',
        black: 'hsl(var(--color-black) / <alpha-value>)',
        'slider-1': 'hsl(var(--color-slider-1) / <alpha-value>)',
        'slider-2': 'hsl(var(--color-slider-2) / <alpha-value>)',
        'slider-3': 'hsl(var(--color-slider-3) / <alpha-value>)',
        'slider-4': 'hsl(var(--color-slider-4) / <alpha-value>)',
        'slider-5': 'hsl(var(--color-slider-5) / <alpha-value>)',
        'slider-6': 'hsl(var(--color-slider-6) / <alpha-value>)',
        'slider-7': 'hsl(var(--color-slider-7) / <alpha-value>)',
        'slider-8': 'hsl(var(--color-slider-8) / <alpha-value>)',
      },
      containers: {
        'nav-0': '140px',
        'nav-1': '225px',
        'nav-2': '310px',
        'nav-3': '440px',
        'nav-4': '540px',
        'nav-5': '600px',
        'nav-6': '650px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '16px'],
        xs: ['12px', '16px'],
        sm: ['14px', '18px'],
        base: ['16px', '20px'],
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
      gridTemplateColumns: {
        chart: 'minmax(100px, 100%) 346px',
      },
      height: {
        4.5: '18px',
        9: '36px',
        15: '60px',
        18: '72px',
        45: '180px',
        50: '200px',
        55: '220px',
        75: '300px',
        'screen-full': '100dvh',
        'screen/90': '90dvh',
        'screen/80': '80dvh',
        'screen/70': '70dvh',
        'screen/60': '60dvh',
        'screen/50': '50dvh',
        'screen/40': '40dvh',
        'screen/30': '30dvh',
        'screen/20': '20dvh',
        'screen/10': '10dvh',
      },
      hueRotate: {
        '-82': '-82deg',
      },
      keyframes: {
        check: {
          '0%': {
            strokeDashoffset: -100,
          },
          '100%': {
            strokeDashoffset: 900,
          },
        },
        circle: {
          '0%': {
            strokeDashoffset: 1000,
          },
          '100%': {
            strokeDashoffset: 0,
          },
        },
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
        vector: {
          '0%': { opacity: 0 },
          '33%': { opacity: 0.3 },
          '66%': { opacity: 0.6 },
          '100%': { opacity: 0 },
        },
      },
      letterSpacing: {
        normal: 0,
        wide: '2px',
        wider: '3px',
        widest: '5px',
      },
      maxHeight: {
        70: '280px',
      },
      minHeight: {
        3: '12px',
        5: '20px',
        8: '32px',
        10: '40px',
        14: '56px',
        30.5: '122px',
        75: '300px',
        'screen-full': '100dvh',
        'screen/90': '90dvh',
        'screen/80': '80dvh',
        'screen/70': '70dvh',
        'screen/60': '60dvh',
        'screen/50': '50dvh',
        'screen/40': '40dvh',
        'screen/30': '30dvh',
        'screen/20': '20dvh',
        'screen/10': '10dvh',
      },
      maxWidth: {
        content: '1024px',
        v1: '1248px',
        modal: '895px',
        'modal-lg': '650px',
        'modal-md': '556px',
        'modal-sm': '526px',
        'modal-xs': '442px',
        'screen-full': '100dvw',
        'screen/90': '90dvw',
        'screen/80': '80dvw',
        'screen/70': '70dvw',
        'screen/60': '60dvw',
        'screen/50': '50dvw',
        'screen/40': '40dvw',
        'screen/30': '30dvw',
        'screen/20': '20dvw',
        'screen/10': '10dvw',
      },
      minWidth: {
        13: '52px',
        15: '60px',
        16: '64px',
        18: '72px',
        25: '100px',
        29: '116px',
        30: '120px',
        35: '140px',
        35.5: '142px',
        37: '148px',
        40: '160px',
        50: '200px',
        60: '240px',
        90: '360px',
        20: '80px',
        28: '112px',
        92.5: '370px',
        94: '376px',
      },
      padding: {
        5.5: '22px',
        12: '48px',
        18: '72px',
        21: '84px',
      },
      screens: {
        sm: '480px',
        md: '920px',
        lg: '1280px',
        xl: '1280px',
        '2xl': '1920px',
      },
      spacing: {
        4.5: '17px',
        6.5: '26px',
        18: '72px',
        24: '96px',
        35: '140px',
        70: '280px',
        74: '296px',
        80: '320px',
        90: '360px',
        98: '392px',
        102: '408px',
        118: '472px',
        full: '100%',
      },
      transitionDuration: {
        3000: '3000ms',
        120000: '120000ms',
        150000: '150000ms',
        180000: '180000ms',
        DEFAULT: '500ms',
      },
      transitionProperty: {
        background: 'filter, -webkit-filter',
      },
      width: {
        4.5: '18px',
        13: '52px',
        15: '60px',
        18: '72px',
        25: '100px',
        29: '116px',
        30: '120px',
        35: '140px',
        40: '160px',
        50: '200px',
        60: '240px',
        90: '360px',
        92.5: '370px',
        94: '376px',
        100: '400px',
        110: '440px',
        120: '480px',
        140: '560px',
        180: '720px',
        'screen-full': '100dvw',
        'screen/90': '90dvw',
        'screen/80': '80dvw',
        'screen/70': '70dvw',
        'screen/60': '60dvw',
        'screen/50': '50dvw',
        'screen/40': '40dvw',
        'screen/30': '30dvw',
        'screen/20': '20dvw',
        'screen/10': '10dvw',
      },
      zIndex: {
        1: '1',
        2: '2',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/container-queries'),
    plugin(function ({ addBase, addUtilities, theme }) {
      addBase({
        h1: { fontSize: '61px', lineHeight: '80px', fontWeight: theme('fontWeight.light') },
        h2: { fontSize: '9px', lineHeight: '56px' },
        h3: { fontSize: '30px', lineHeight: '40px' },
        h4: { fontSize: '24px', lineHeight: '36px', fontWeight: theme('fontWeight.normal') },
      })

      addUtilities({
        '.blur-orb-primary': {
          filter: 'blur(clamp(50px, 8vw, 30px))',
        },
        '.blur-orb-secondary': {
          filter: 'blur(clamp(60px, 20vw, 160px))',
        },
        '.blur-orb-tertiary': {
          filter: 'blur(clamp(60px, 10vw, 150px))',
        },
        '.border-glas': {
          background:
            'linear-gradient(180deg,  hsl(var(--color-white) /0.2),  hsl(var(--color-white) /0.05))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          '-webkit-mask-composite': 'xor',
          maskComposite: 'exclude',
        },
        '.glow-line': {
          x: 0,
          y: 0,
          fill: 'transparent',
          stroke: 'hsl(var(--color-white))',
          strokeWidth: '0.5',
          strokeDasharray: '20px 30px',
        },
        '.glow-hover': {
          strokeDashoffset: '-80px',
          transition: 'stroke-dashoffset 1000ms ease-in',
        },
        '.gradient-card': {
          background:
            'linear-gradient(180deg, hsl(var(--color-white) /0.2) 0%, hsl(var(--color-white) /0) 100%), linear-gradient(0deg,  hsl(var(--color-white) /0.05),  hsl(var(--color-white) /0.05))',
        },
        '.gradient-card-content': {
          backgroundImage: 'linear-gradient(to right, transparent, hsl(var(--color-white) /0.05))',
        },
        '.gradient-header': {
          background:
            'linear-gradient(90deg, hsl(var(--color-white) /0.1) 0%, hsl(var(--color-white) /0) 50%)',
        },
        '.gradient-intro': {
          background:
            'linear-gradient(90deg, hsl(var(--color-white) /0) 60%, hsl(var(--color-purple-dark) /0.1) 90%)',
        },
        '.gradient-hls-intro': {
          background:
            'linear-gradient(90deg, hsl(var(--color-white) /0) 60%, hsl(var(--color-hls-secondary) /0.1) 90%)',
        },
        '.gradient-hls': {
          background:
            'linear-gradient(180deg, hsl(var(--color-hls-primary)) 0%, hsl(var(--color-hls-secondary)) 50%)',
        },
        '.bg-orb-primary-vaults': {
          background:
            'linear-gradient(180deg, hsl(var(--color-vault-blue-primary)) 0%, hsl(var(--color-vault-blue-secondary)) 65%)',
        },
        '.bg-orb-secondary-vaults': {
          background:
            'linear-gradient(90deg, hsl(var(--color-vault-purple-primary)) 50%, hsl(var(--color-vault-purple-secondary)) 127%)',
        },
        '.bg-orb-tertiary-vaults': {
          background:
            'linear-gradient(180deg, hsl(var(--color-vault-pink-primary)) 0%, hsl(var(--color-vault-blue-tertiary)) 65%)',
        },
        '.gradient-popover': {
          background:
            'linear-gradient(180deg, hsl(var(--color-white) /0.1) 0%,  hsl(var(--color-white) /0) 100%), linear-gradient(0deg,  hsl(var(--color-white) /0.1), hsl(var(--color-white) /0.05))',
        },
        '.gradient-primary-to-secondary': {
          background:
            'linear-gradient(180deg, hsl(var(--color-purple)) 0%, hsl(var(--color-purple-dark)) 100%)',
        },
        '.gradient-secondary-to-primary': {
          background:
            'linear-gradient(180deg, hsl(var(--color-purple-dark)) 100%, hsl(var(--color-purple)) 0%)',
        },
        '.gradient-slider-1': {
          background:
            'linear-gradient(to right, hsl(var(--color-slider-1)), hsl(var(--color-slider-2)))',
        },
        '.gradient-slider-2': {
          background:
            'linear-gradient(to right, hsl(var(--color-slider-3)), hsl(var(--color-slider-4)))',
        },
        '.gradient-slider-3': {
          background:
            'linear-gradient(to right, hsl(var(--color-slider-5)), hsl(var(--color-slider-6)))',
        },
        '.gradient-slider-4': {
          background:
            'linear-gradient(to right, hsl(var(--color-slider-7)), hsl(var(--color-slider-8)))',
        },
        '.gradient-slider-pink': {
          background:
            'linear-gradient(270deg, hsl(var(--color-slider-pink-primary) /0.89) 0%, hsl(var(--color-slider-pink-secondary) /0.05) 100%)',
        },
        '.gradient-slider-green': {
          background:
            'linear-gradient(270deg, hsl(var(--color-slider-green-primary) /0.886) 0%, hsl(var(--color-slider-green-secondary) /0.051) 100%)',
        },
        '.gradient-slider-red': {
          background:
            'linear-gradient(270deg, hsl(var(--color-slider-red-primary) /0.886) 0%, hsl(var(--color-slider-red-secondary) /0.051) 100%)',
        },
        '.gradient-tooltip': {
          background:
            'linear-gradient(77.47deg, hsl(var(--color-tooltip-primary) /0.9) 11.58%, hsl(var(--color-tooltip-secondary) /0.9) 93.89%)',
        },
        '.gradient-active-tab': {
          background:
            'linear-gradient(270deg, hsl(var(--color-active-tab-primary) /0.765) 0%, hsl(var(--color-active-tab-secondary) /0.886) 23.77%, hsl(var(--color-active-tab-tertiary) /0.26) 99.2%)',
        },
        '.gradient-droplets': {
          background: 'linear-gradient(90deg, #6039FF, #E8B8FF)',
        },
        '.gradient-stride': {
          background: 'linear-gradient(90deg, #E50571, #FB5DA9)',
        },
        '.gradient-lido': {
          background:
            'linear-gradient(rgb(101, 98, 255) 11.28%, rgb(0, 163, 255) 61.02%, rgb(99, 214, 210) 100%)',
        },
        '.gradient-milkyway': {
          background: 'linear-gradient(90deg, #FEf7F1 0%, #FDE2FB 50%, #FDE4FC 100%)',
        },
        '.number': {
          whiteSpace: 'nowrap',
          fontFeatureSettings: '"tnum" on',
        },
        '.slider-mask': {
          mask: 'linear-gradient(hsl(var(--color-white)) 0 0)',
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
          fontSize: '16px',
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
        '.bg-v1': {
          backgroundImage: 'url(/images/bg-v1.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% auto',
          backgroundPosition: 'top',
        },
        '.droplets': {
          background: 'linear-gradient(90deg, #6039FF, #E8B8FF)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          fontWeight: 600,
        },
        '.stride': {
          background: 'linear-gradient(90deg, #E50571, #FB5DA9)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          fontWeight: 600,
        },
        '.lido': {
          background:
            'linear-gradient(90deg, rgb(101, 98, 255) 11.28%, rgb(0, 163, 255) 61.02%, rgb(99, 214, 210) 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          fontWeight: 600,
        },
        '.milkyway': {
          background: 'linear-gradient(90deg, #FEf7F1 0%, #FDE2FB 50%, #FDE4FC 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          fontWeight: 600,
        },
      })
    }),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'animate-delay': (value) => {
            return {
              'animation-delay': value,
            }
          },
        },
        {
          values: theme('transitionDelay'),
        },
      )
    }),
  ],
}
