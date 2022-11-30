import classNames from 'classnames'
import React, { ReactNode } from 'react'

interface Props extends React.HTMLProps<HTMLAnchorElement> {
  children?: string | ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  externalLink?: boolean
  textSize?: 'small' | 'medium' | 'large'
  text?: string | ReactNode
  uppercase?: boolean
}

const colorClasses = {
  primary:
    'text-primary hover:text-primary-highlight active:text-primary-highlight-10 focus:text-primary-highlight',
  secondary:
    'text-secondary hover:text-secondary-highlight active:text-secondary-highlight-10 focus:text-secondary-highlight',
  tertiary:
    'text-secondary-dark/60 hover:text-secondary-dark active:text-secondary-dark-10 focus:text-secondary-dark',
  quaternary: 'hover:text-white active:text-white',
}
const textSizeClasses = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

const TextLink = ({
  children,
  className = '',
  color = 'primary',
  disabled,
  externalLink,
  href,
  textSize = 'small',
  text,
  uppercase,
  onClick,
  ...restProps
}: Props) => {
  const linkClasses = classNames(
    uppercase ? `${textSizeClasses[textSize]}-caps` : textSizeClasses[textSize],
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
        onClick && !href
          ? (e) => {
              e.preventDefault()
              if (disabled) return
              onClick
            }
          : undefined
      }
      href={!href ? '#' : href}
      {...restProps}
    >
      {text && !children && text}
      {children && children}
    </a>
  )
}

export default TextLink
