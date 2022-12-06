import classNames from 'classnames'
import React, { LegacyRef, ReactNode } from 'react'

import CircularProgress from 'components/CircularProgress'

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
}

const colorClasses = {
  primary:
    'border-none bg-primary hover:bg-primary-highlight active:bg-primary-highlight-10 focus:bg-primary-highlight',
  secondary:
    'border-none bg-secondary hover:bg-secondary-highlight active:bg-secondary-highlight-10 focus:bg-secondary-highlight',
  tertiary:
    'border bg-secondary-dark/60 border-white/60 hover:bg-secondary-dark hover:border-white active:bg-secondary-dark-10 active:border-white focus:bg-secondary-dark focus:border-white',
  quaternary:
    'border bg-transparent text-white/60 border-transparent hover:text-white hover:border-white active:text-white active:border-white',
}

const transparentColorClasses = {
  primary:
    'border-none text-primary hover:text-primary-highlight active:text-primary-highlight focus:text-primary-highlight',
  secondary:
    'border-none text-secondary hover:text-secondary-highlight active:text-secondary-highlight focus:text-secondary-highlight',
  tertiary:
    'text-secondary-dark hover:text-secondary-dark-10 active:text-secondary-dark-10 focus:text-secondary-dark-10',
  quaternary:
    'border border-transparent text-white/60 hover:text-white hover:border-white active:text-white active:border-white',
}

const roundSizeClasses = {
  small: 'h-[32px] w-[32px]',
  medium: 'h-[40px] w-[40px]',
  large: 'h-[56px] w-[56px]',
}

const sizeClasses = {
  small: 'text-sm px-5 py-1.5 min-h-[32px]',
  medium: 'text-base px-6 py-2.5 min-h-[40px]',
  large: 'text-lg px-6 py-2.5 min-h-[56px]',
}

const variantClasses = {
  solid: 'text-white',
  transparent: 'bg-transparent p-0',
  round: 'rounded-full p-0',
  text: 'border-none bg-transparent',
}

const Button = React.forwardRef(function Button(
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
  }: Props,
  ref,
) {
  const buttonClasses = []

  switch (variant) {
    case 'round':
      buttonClasses.push(sizeClasses[size], roundSizeClasses[size], colorClasses[color])
      break
    case 'transparent':
      buttonClasses.push(sizeClasses[size], transparentColorClasses[color])
      break

    case 'solid':
      buttonClasses.push(sizeClasses[size], colorClasses[color])
      break
    default:
  }

  return (
    <button
      className={classNames(
        'cursor-pointer appearance-none break-normal rounded-3xl outline-none transition-colors',
        buttonClasses,
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      id={id}
      ref={ref as LegacyRef<HTMLButtonElement>}
      onClick={disabled ? () => {} : onClick}
    >
      {text && !children && !showProgressIndicator && <span>{text}</span>}
      {children && !showProgressIndicator && children}
      {showProgressIndicator && (
        <CircularProgress size={size === 'small' ? 10 : size === 'medium' ? 12 : 18} />
      )}
    </button>
  )
})

export default Button
