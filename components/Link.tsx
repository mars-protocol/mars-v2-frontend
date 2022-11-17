import classNames from 'classnames'
import React, { ReactNode } from 'react'

interface Props {
  children?: string | ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  disabled?: boolean
  externalLink?: String
  href?: string
  size?: 'small' | 'medium' | 'large'
  text?: string | ReactNode
  onClick?: (e: any) => void
}

const Link = ({
  children,
  className = '',
  color = 'primary',
  disabled,
  externalLink,
  href,
  size = 'small',
  text,
  onClick,
}: Props) => {
  const Link = () => {
    const colorClasses = {
      primary:
        'text-primary hover:text-primary-highlight active:text-primary-highlight-10 focus:text-primary-highlight',
      secondary:
        'text-secondary hover:text-secondary-highlight active:text-secondary-highlight-10 focus:text-secondary-highlight',
      tertiary:
        'text-secondary-dark/60 hover:text-secondary-dark active:text-secondary-dark-10 focus:text-secondary-dark',
      quaternary: 'text-transparent text-white/60 hover:text-white active:text-white',
    }
    const sizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    }

    const linkClasses = classNames(
      sizeClasses[size],
      colorClasses[color],
      disabled && 'pointer-events-none opacity-50',
      className,
    )

    return (
      <a
        className={linkClasses}
        target={externalLink ? '_blank' : '_self'}
        rel='noreferrer'
        onClick={
          onClick && href
            ? (e) => {
                e.preventDefault()
                if (disabled) return
                onClick
              }
            : undefined
        }
        href={!href ? '#' : href}
      >
        {text && !children && text}
        {children && children}
      </a>
    )
  }
}

export default Link
