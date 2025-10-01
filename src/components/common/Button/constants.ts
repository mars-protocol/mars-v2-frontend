export const buttonColorClasses = {
  primary:
    'font-bold gradient-primary-to-secondary hover:bg-surface active:bg-card-bg focus:bg-surface',
  secondary:
    'border border-white/30 bg-transparent hover:bg-surface active:bg-card-bg focus:bg-surface',
  tertiary: 'bg-card-bg hover:bg-surface active:bg-card-border focus:bg-surface',
  quaternary: 'bg-transparent text-white/60 hover:text-white active:text-white',
}

export const focusClasses = {
  primary: 'bg-surface hover:border hover:border-white/40',
  secondary: 'bg-surface hover:border hover:border-white/40',
  tertiary: 'bg-surface hover:border hover:border-white/40',
  quaternary: 'text-white',
}

export const buttonGradientClasses = [
  'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:opacity-0',
  'before:gradient-secondary-to-primary before:transition-opacity before:ease-in',
  'hover:before:opacity-100',
]

export const buttonTransparentColorClasses = {
  primary: 'hover:text-primary active:text-primary focus:text-primary',
  secondary: 'hover:text-secondary active:text-secondary focus:text-secondary',
  tertiary: 'hover:text-white/80 active:text-white/80 focus:text-white/80',
  quaternary: 'text-white/60 hover:text-white active:text-white',
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
  solid: 'text-white shadow-button justify-center group',
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
