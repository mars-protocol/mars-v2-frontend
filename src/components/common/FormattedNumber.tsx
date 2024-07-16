import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from 'react-spring'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { formatValue } from 'utils/formatters'

interface Props {
  amount: number
  options?: FormatOptions
  className?: string
  animate?: boolean
  parentheses?: boolean
  smallerThanThreshold?: boolean
}

export const FormattedNumber = React.memo(
  (props: Props) => {
    const [reduceMotion] = useLocalStorage<boolean>(
      LocalStorageKeys.REDUCE_MOTION,
      DEFAULT_SETTINGS.reduceMotion,
    )
    const prevAmountRef = useRef<number>(0)

    let { options, smallerThanThreshold } = props

    if (smallerThanThreshold) {
      if (!options) options = { prefix: '< ' }
      if (options.prefix && options.prefix.substring(0, 1) !== '<')
        options.prefix = `< ${options.prefix}`
      else options.prefix = '< '
    }

    useEffect(() => {
      if (prevAmountRef.current !== props.amount) prevAmountRef.current = props.amount
    }, [props.amount])

    const springAmount = useSpring({
      number: isNaN(props.amount) ? 0 : props.amount,
      from: { number: isNaN(prevAmountRef.current) ? 0 : prevAmountRef.current },
      config: { duration: 1000 },
    })

    if (
      (prevAmountRef.current === props.amount && props.amount === 0) ||
      !props.animate ||
      prevAmountRef.current === 0 ||
      reduceMotion
    )
      return (
        <p
          className={classNames(
            'number',
            props.parentheses && 'before:content-["("] after:content-[")"]',
            props.className,
          )}
        >
          {formatValue(props.amount.toString(), options)}
        </p>
      )

    return (
      <animated.p
        className={classNames(
          'number',
          props.parentheses && 'before:content-["("] after:content-[")"]',
          props.className,
        )}
      >
        {springAmount.number.to((num) => formatValue(num, props.options))}
      </animated.p>
    )
  },
  (prevProps, nextProps) =>
    prevProps.amount === nextProps.amount &&
    JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options) &&
    prevProps.className === nextProps.className,
)

FormattedNumber.displayName = 'FormattedNumber'
