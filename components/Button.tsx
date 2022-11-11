import classNames from 'classnames'
import React, { ReactNode } from 'react'

import CircularProgress from './CircularProgress'

interface Props {
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  disabled?: boolean
  externalLink?: string
  id?: string
  children?: string | ReactNode
  text?: string | ReactNode
  showProgressIndicator?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'solid' | 'transparent' | 'round'
  onClick?: (e: any) => void
}

const Button = React.forwardRef<any, Props>(
  (
    {
      children,
      className = '',
      color = 'primary',
      disabled,
      externalLink,
      id = '',
      showProgressIndicator,
      size = 'small',
      text,
      variant = 'solid',
      onClick,
    },
    ref,
  ) => {
    const Button = () => {
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
      }

      const buttonClasses = classNames(
        'transition-colors appearance-none rounded-3xl cursor-pointer outline-none break-normal',
        variant === 'round' ? `${sizeClasses[size]} ${roundSizeClasses[size]}` : sizeClasses[size],
        variant === 'transparent' ? transparentColorClasses[color] : colorClasses[color],
        variantClasses[variant],
        disabled && 'pointer-events-none opacity-50',
        className,
      )
      return (
        <button className={buttonClasses} id={id} onClick={disabled ? () => {} : onClick} ref={ref}>
          <>
            {text && !children && !showProgressIndicator && <span>{text}</span>}
            {children && !showProgressIndicator && children}
            {showProgressIndicator && (
              <CircularProgress size={size === 'small' ? 10 : size === 'medium' ? 12 : 18} />
            )}
          </>
        </button>
      )
    }

    return externalLink ? (
      <a
        className='flex hover:no-underline focus:no-underline active:no-underline'
        href={externalLink}
        ref={ref}
        rel='noopener noreferrer'
        target='_blank'
      >
        {Button()}
      </a>
    ) : (
      Button()
    )
  },
)

Button.displayName = 'Button'
export default Button
