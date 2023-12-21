import classNames from 'classnames'
import React, { LegacyRef, useMemo } from 'react'

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
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'

const Button = React.forwardRef(function Button(
  {
    autoFocus,
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
    onMouseOver,
    leftIcon,
    rightIcon,
    iconClassName,
    hasSubmenu,
    hasFocus,
    dataTestId,
    tabIndex = 0,
    textClassNames,
  }: ButtonProps,
  ref,
) {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const isDisabled = disabled || showProgressIndicator
  const shouldShowText = text && !children
  const shouldShowGlowElement = variant === 'solid' && !isDisabled && !reduceMotion

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
      'appearance-none break-normal outline-none',
      'text-white transition-all',
      'hover:cursor-pointer',
      !reduceMotion && 'transition-color',
      buttonClasses,
      buttonVariantClasses[variant],
      variant === 'solid' && color === 'tertiary' && buttonBorderClasses,
      variant === 'solid' && color === 'primary' && buttonGradientClasses,
      isDisabled && 'pointer-events-none opacity-50',
      hasFocus && focusClasses[color],
      className,
    )
  }, [className, color, reduceMotion, hasFocus, isDisabled, size, variant])

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
      onMouseOver={isDisabled ? () => {} : onMouseOver}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
    >
      {showProgressIndicator ? (
        <CircularProgress size={circularProgressSize[size]} />
      ) : (
        <>
          {leftIcon && <span className={classNames(leftIconClassNames)}>{leftIcon}</span>}
          {shouldShowText && <span className={textClassNames}>{text}</span>}
          {children && children}
          {rightIcon && <span className={classNames(rightIconClassNames)}>{rightIcon}</span>}
          {hasSubmenu && (
            <span data-testid='button-submenu-indicator' className='ml-2 inline-block w-2.5'>
              <ChevronDown />
            </span>
          )}
        </>
      )}
      {shouldShowGlowElement && glowElement(!reduceMotion)}
    </button>
  )
})

export default Button
