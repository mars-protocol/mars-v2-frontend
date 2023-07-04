import classNames from 'classnames'
import React, { LegacyRef, ReactElement, ReactNode, useMemo } from 'react'

import {
  buttonBorderClasses,
  buttonColorClasses,
  buttonGradientClasses,
  buttonPaddingClasses,
  buttonRoundSizeClasses,
  buttonSizeClasses,
  buttonTransparentColorClasses,
  buttonVariantClasses,
  circularProgressSize,
  focusClasses,
} from 'components/Button/constants'
import { glowElement } from 'components/Button/utils'
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
  size?: 'xs' | 'sm' | 'md' | 'lg'
  text?: string | ReactNode
  variant?: 'solid' | 'transparent' | 'round'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  leftIcon?: ReactElement
  rightIcon?: ReactElement
  iconClassName?: string
  hasSubmenu?: boolean
  hasFocus?: boolean
  dataTestId?: string
  tabIndex?: number
}

const Button = React.forwardRef(function Button(
  {
    children,
    className = '',
    color = 'primary',
    disabled,
    id = '',
    showProgressIndicator,
    size = 'sm',
    text,
    variant = 'solid',
    onClick,
    leftIcon,
    rightIcon,
    iconClassName,
    hasSubmenu,
    hasFocus,
    dataTestId,
    tabIndex = 0,
  }: Props,
  ref,
) {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const isDisabled = disabled || showProgressIndicator
  const shouldShowText = text && !children
  const shouldShowGlowElement = variant === 'solid' && !isDisabled

  const buttonClassNames = useMemo(() => {
    const buttonClasses = [
      buttonSizeClasses[size],
      buttonPaddingClasses[size],
      buttonColorClasses[color],
    ]

    if (variant === 'round') {
      buttonClasses.push(buttonColorClasses[color], buttonRoundSizeClasses[size])
    } else if (variant === 'transparent') {
      buttonClasses.push(buttonTransparentColorClasses[color])
    }

    return classNames(
      'relative z-1 flex items-center',
      'cursor-pointer appearance-none break-normal outline-none',
      'text-white transition-all',
      enableAnimations && 'transition-color',
      buttonClasses,
      buttonVariantClasses[variant],
      variant === 'solid' && color === 'tertiary' && buttonBorderClasses,
      variant === 'solid' && color === 'primary' && buttonGradientClasses,
      isDisabled && 'pointer-events-none opacity-50',
      hasFocus && focusClasses[color],
      className,
    )
  }, [className, color, enableAnimations, hasFocus, isDisabled, size, variant])

  const [leftIconClassNames, rightIconClassNames] = useMemo(() => {
    const hasContent = !!(text || children)
    const iconClasses = ['flex items-center justify-center', iconClassName ?? 'h-4 w-4']
    const leftIconClasses = [...iconClasses, hasContent && 'mr-2']
    const rightIconClasses = [...iconClasses, hasContent && 'ml-2']

    return [leftIconClasses, rightIconClasses]
  }, [children, iconClassName, text])

  return (
    <button
      data-testid={dataTestId}
      className={buttonClassNames}
      id={id}
      ref={ref as LegacyRef<HTMLButtonElement>}
      onClick={isDisabled ? () => {} : onClick}
      tabIndex={tabIndex}
    >
      {showProgressIndicator ? (
        <CircularProgress size={circularProgressSize[size]} />
      ) : (
        <>
          {leftIcon && <span className={classNames(leftIconClassNames)}>{leftIcon}</span>}
          {shouldShowText && <span>{text}</span>}
          {children && children}
          {rightIcon && <span className={classNames(rightIconClassNames)}>{rightIcon}</span>}
          {hasSubmenu && (
            <span data-testid='button-submenu-indicator' className='ml-2 inline-block w-2.5'>
              <ChevronDown />
            </span>
          )}
        </>
      )}
      {shouldShowGlowElement && glowElement(enableAnimations)}
    </button>
  )
})

export default Button
