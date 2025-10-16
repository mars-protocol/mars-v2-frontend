import classNames from 'classnames'
import React, { LegacyRef, useMemo } from 'react'

import {
  buttonColorClasses,
  buttonGradientClasses,
  buttonPaddingClasses,
  buttonRoundSizeClasses,
  buttonSecondaryGradientClasses,
  buttonSizeClasses,
  buttonTertiaryGradientClasses,
  buttonTransparentColorClasses,
  buttonVariantClasses,
  circularProgressSize,
  focusClasses,
} from 'components/common/Button/constants'
import { CircularProgress } from 'components/common/CircularProgress'
import { ChevronDown } from 'components/common/Icons'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

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
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const isDisabled = disabled || showProgressIndicator
  const shouldShowText = text && !children

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

    let textColorClass = 'text-white light:text-black'
    if (color === 'primary') {
      textColorClass =
        'text-white light:text-primary font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] light:drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
    } else if (color === 'secondary') {
      textColorClass = 'text-white light:text-black font-semibold transition-colors duration-300'
    } else if (color === 'tertiary') {
      textColorClass =
        'text-zinc-400 light:text-zinc-600 hover:text-white light:hover:text-black font-medium transition-colors duration-300'
    } else if (color === 'long' || color === 'short') {
      textColorClass = 'text-white font-bold'
    }

    let gradientClasses: string[] = []
    if (color === 'primary') {
      gradientClasses = buttonGradientClasses
    } else if (color === 'secondary') {
      gradientClasses = buttonSecondaryGradientClasses
    } else if (color === 'tertiary') {
      gradientClasses = buttonTertiaryGradientClasses
    }

    return classNames(
      'relative z-1 flex items-center',
      'appearance-none break-normal',
      textColorClass,
      isDisabled ? 'cursor-not-allowed' : 'hover:cursor-pointer',
      !reduceMotion && 'transition-all duration-300',
      buttonClasses,
      buttonVariantClasses[variant],
      variant === 'solid' && !isDisabled && gradientClasses,
      isDisabled && 'pointer-events-none opacity-40 grayscale',
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
      <span className='relative z-10 flex items-center'>
        {showProgressIndicator ? (
          <CircularProgress size={circularProgressSize[size]} />
        ) : (
          <>
            {leftIcon && <span className={classNames(leftIconClassNames)}>{leftIcon}</span>}
            {shouldShowText && <span className={textClassNames}>{text}</span>}
            {children}
            {rightIcon && <span className={classNames(rightIconClassNames)}>{rightIcon}</span>}
            {hasSubmenu && (
              <span
                data-testid='button-submenu-indicator'
                className='ml-2 inline-block w-3 md:w-2.5'
              >
                <ChevronDown />
              </span>
            )}
          </>
        )}
      </span>
    </button>
  )
})

export default Button
