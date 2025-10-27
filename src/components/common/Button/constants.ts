/**
 * Button Design System
 *
 * Visual Hierarchy & Identity:
 * - PRIMARY: Filled background, bottom oval glow (grounded, immersive, main actions)
 * - SECONDARY: Outlined, gradient underline with glow (refined, clean, alternative actions)
 * - TERTIARY: Outlined, minimal border highlight (subtle, understated, low-priority actions)
 * - LONG: Solid green background, no gradients (trading action - buy/long position)
 * - SHORT: Solid red background, no gradients (trading action - sell/short position)
 *
 * Unified by:
 * - Primary/Secondary/Tertiary use primary color for glow effects
 * - Long/Short are industry-standard solid colors (no gradients or glows)
 * - Progressive intensity: immersive oval → gradient underline → minimal highlight
 * - All have transition timing for smooth interactions
 * - All support light/dark modes
 */
export const buttonColorClasses = {
  primary:
    'relative bg-zinc-900 light:bg-zinc-100 outline outline-[1.50px] outline-offset-[-1.50px] outline-primary/60 light:outline-primary/70 overflow-hidden shadow-[0_0_20px_rgba(255,99,99,0.15)] light:shadow-[0_0_20px_rgba(255,99,99,0.2)]',
  secondary:
    'relative bg-transparent outline outline-[1.50px] outline-offset-[-1.50px] outline-zinc-700 light:outline-zinc-400 hover:outline-primary/50 light:hover:outline-primary/60 overflow-hidden transition-all duration-300',
  tertiary:
    'relative bg-transparent outline outline-1 outline-offset-[-1px] outline-zinc-800 light:outline-zinc-400 hover:outline-primary/40 light:hover:outline-primary/50 overflow-hidden transition-all duration-300',
  quaternary:
    'bg-transparent text-white/60 light:text-black/60 hover:text-white light:hover:text-black active:text-white light:active:text-black',
  long: 'relative bg-green hover:bg-green/90 active:bg-green/80 transition-colors duration-200',
  short: 'relative bg-loss hover:bg-loss/90 active:bg-loss/80 transition-colors duration-200',
}

export const focusClasses = {
  primary: 'outline-primary/50 light:outline-primary/60',
  secondary: 'outline-white/30 bg-white/10 light:outline-zinc-500',
  tertiary: 'outline-white/30 light:outline-zinc-500',
  quaternary: 'text-white light:text-black',
  long: 'outline-green/50',
  short: 'outline-loss/50',
}

export const buttonGradientClasses = [
  'before:content-[""] before:absolute before:w-[200%] before:h-48 before:left-1/2 before:top-[75%] before:-translate-x-1/2 before:bg-primary before:rounded-[50%] before:blur-[12px] before:opacity-0 before:z-0',
  'hover:before:opacity-100 before:transition-opacity before:duration-300 before:ease-in-out',
  'after:content-[""] after:absolute after:inset-0 after:bg-primary/5 after:opacity-0 after:transition-opacity after:duration-300 after:z-0',
  'hover:after:opacity-100',
]

export const buttonSecondaryGradientClasses = [
  'before:content-[""] before:absolute before:w-32 before:h-0.5 before:left-1/2 before:-translate-x-1/2 before:bottom-0 before:bg-gradient-to-r before:from-primary/0 before:via-primary before:to-primary/0 before:opacity-0 before:z-0',
  'hover:before:opacity-100 before:transition-opacity before:duration-300',
]

export const buttonTertiaryGradientClasses = [
  'before:content-[""] before:absolute before:inset-[-1px] before:rounded-[inherit] before:bg-primary/0 before:transition-all before:duration-300 before:z-0',
  'hover:before:bg-primary/20 hover:before:blur-[2px]',
]

export const buttonTransparentColorClasses = {
  primary: 'hover:text-primary active:text-primary focus:text-primary',
  secondary: 'hover:text-secondary active:text-secondary focus:text-secondary',
  tertiary:
    'hover:text-white/80 light:hover:text-black/80 active:text-white/80 light:active:text-black/80 focus:text-white/80 light:focus:text-black/80',
  quaternary:
    'text-white/60 light:text-black/60 hover:text-white light:hover:text-black active:text-white light:active:text-black',
  long: 'text-white hover:text-white active:text-white',
  short: 'text-white hover:text-white active:text-white',
}

export const buttonRoundSizeClasses = {
  xs: 'h-5 w-5',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
}

export const buttonSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export const buttonPaddingClasses = {
  xs: 'px-1.5 py-0.5 min-h-5',
  sm: 'px-4 py-1.5 min-h-8',
  md: 'px-4 py-2 min-h-10',
  lg: 'px-4 py-2.5 min-h-14',
}

export const buttonVariantClasses = {
  solid: 'justify-center group font-medium',
  transparent: 'bg-transparent p-0 transition duration-200 ease-in',
  round: 'p-0',
  rounded: '',
}

export const circularProgressSize = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 18,
}
