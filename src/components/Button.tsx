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
    'border-none gradient-primary-button text-white hover:bg-white/20 active:bg-white/40 focus:bg-white/20',
  secondary:
    'border border-white/30 bg-transparent text-white hover:bg-white/20 active:bg-white/40 focus:bg-white/20',
  tertiary:
    'border-none button-tertiary bg-white/10 text-white hover:bg-white/20 active:bg-white/40 focus:bg-white/20',
  quaternary:
    'bg-transparent text-white/60 border-transparent hover:text-white hover:border-white active:text-white active:border-white',
}

const buttonTransparentColorClasses = {
  primary:
    'border-none text-primary hover:text-primary-highlight active:text-primary-highlight focus:text-primary-highlight',
  secondary:
    'border-none text-secondary hover:text-secondary-highlight active:text-secondary-highlight focus:text-secondary-highlight',
  tertiary:
    'text-secondary-dark hover:text-secondary-dark-10 active:text-secondary-dark-10 focus:text-secondary-dark-10',
  quaternary:
    'border border-transparent text-white/60 hover:text-white hover:border-white active:text-white active:border-white',
}

const buttonRoundSizeClasses = {
  small: 'h-[32px] w-[32px]',
  medium: 'h-[40px] w-[40px]',
  large: 'h-[56px] w-[56px]',
}

export const buttonSizeClasses = {
  small: 'text-sm px-2.5 py-1.5 min-h-[32px]',
  medium: 'text-base px-3 py-2 min-h-[40px]',
  large: 'text-lg px-3.5 py-2.5 min-h-[56px]',
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
        buttonColorClasses[color],
      )
      break

    case 'transparent':
      buttonClasses.push(buttonSizeClasses[size], buttonTransparentColorClasses[color])
      break

    case 'solid':
      buttonClasses.push(buttonSizeClasses[size], buttonColorClasses[color])
      break
    default:
  }

  return (
    <button
      className={classNames(
        'flex items-center',
        'outline-nones cursor-pointer appearance-none break-normal rounded-2xs',
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
        <span className='mr-2 flex h-4 w-4 items-center justify-center'>{icon}</span>
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
