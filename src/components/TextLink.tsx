import classNames from 'classnames'
import React, { LegacyRef, ReactNode } from 'react'

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
    'text-primary hover:text-secondary active:text-secondary/90 focus:text-text-secondary/90',
  secondary: 'text-secondary hover:text-primary active:text-primary/90 focus:text-text-primary/90',
  tertiary: 'text-white/80 hover:text-white active:text-white/90 focus:text-text-white/90',
  quaternary: 'hover:text-white active:text-white',
}
const textSizeClasses = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

export const TextLink = React.forwardRef(function TextLink(
  {
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
  }: Props,
  ref,
) {
  return (
    <a
      className={classNames(
        uppercase ? `${textSizeClasses[textSize]}-caps` : textSizeClasses[textSize],
        colorClasses[color],
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      ref={ref as LegacyRef<HTMLAnchorElement>}
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
})
