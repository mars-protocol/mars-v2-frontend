import classNames from 'classnames'
import React, { LegacyRef, ReactElement, ReactNode } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import { ChevronDown } from 'components/Icons'
import useStore from 'store'

interface Props {
  children?: string | ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  disabled?: boolean
  id?: string
  showProgressIndicator?: boolean
  size?: 'small' | 'medium' | 'large'
  text?: string | ReactNode
  variant?: 'solid' | 'transparent' | 'round' | 'text'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  icon?: ReactElement
  hasSubmenu?: boolean
}

export const buttonColorClasses = {
  primary:
    'border-none gradient-primary-to-secondary hover:bg-white/20 active:bg-white/40 focus:bg-white/20',
  secondary:
    'border border-white/30 bg-transparent hover:bg-white/20 active:bg-white/40 focus:bg-white/20',
  tertiary:
    'border-none button-tertiary bg-white/10 hover:bg-white/20 active:bg-white/40 focus:bg-white/20',
  quaternary:
    'bg-transparent text-white/60 border-transparent hover:text-white hover:border-white active:text-white active:border-white',
}

const buttonTransparentColorClasses = {
  primary: 'border-none hover:text-primary active:text-primary focus:text-primary',
  secondary: 'border-none hover:text-secondary active:text-secondary focus:text-secondary',
  tertiary: 'border-none hover:text-white/80 active:text-white/80 focus:text-white/80',
  quaternary:
    'border-none text-white/60 hover:text-white hover:border-white active:text-white active:border-white',
}

const buttonRoundSizeClasses = {
  small: 'h-[32px] w-[32px]',
  medium: 'h-[40px] w-[40px]',
  large: 'h-[56px] w-[56px]',
}

export const buttonSizeClasses = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

export const buttonPaddingClasses = {
  small: 'px-2.5 py-1.5 min-h-[32px]',
  medium: 'px-3 py-2 min-h-[40px]',
  large: 'px-3.5 py-2.5 min-h-[56px]',
}

export const buttonVariantClasses = {
  solid: 'text-white shadow-button justify-center',
  transparent: 'bg-transparent p-0',
  round: 'rounded-full p-0',
  text: 'border-none bg-transparent',
}

export const Button = React.forwardRef(function Button(
  {
    children,
    className = '',
    color = 'primary',
    disabled,
    id = '',
    showProgressIndicator,
    size = 'small',
    text,
    variant = 'solid',
    onClick,
    icon,
    hasSubmenu,
  }: Props,
  ref,
) {
  const buttonClasses = []
  const enableAnimations = useStore((s) => s.enableAnimations)

  switch (variant) {
    case 'round':
      buttonClasses.push(
        buttonSizeClasses[size],
        buttonRoundSizeClasses[size],
        buttonPaddingClasses[size],
        buttonColorClasses[color],
      )
      break

    case 'transparent':
      buttonClasses.push(buttonSizeClasses[size], buttonTransparentColorClasses[color])
      break

    case 'solid':
      buttonClasses.push(
        buttonSizeClasses[size],
        buttonPaddingClasses[size],
        buttonColorClasses[color],
      )
      break
    default:
  }

  return (
    <button
      className={classNames(
        'flex items-center',
        'outline-nones cursor-pointer appearance-none break-normal rounded-2xs',
        'text-white',
        enableAnimations && 'transition-color',
        buttonClasses,
        buttonVariantClasses[variant],
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      id={id}
      ref={ref as LegacyRef<HTMLButtonElement>}
      onClick={disabled ? () => {} : onClick}
    >
      {icon && !showProgressIndicator && (
        <span
          className={`flex h-4 w-4 items-center justify-center${(text || children) && ' mr-2'}`}
        >
          {icon}
        </span>
      )}
      {text && !children && !showProgressIndicator && <span>{text}</span>}
      {children && !showProgressIndicator && children}
      {hasSubmenu && !showProgressIndicator && (
        <span className='ml-2 inline-block w-2.5'>
          <ChevronDown />
        </span>
      )}
      {showProgressIndicator && (
        <CircularProgress size={size === 'small' ? 10 : size === 'medium' ? 12 : 18} />
      )}
    </button>
  )
})
