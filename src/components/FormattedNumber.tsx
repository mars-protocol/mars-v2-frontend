'use client'

import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from 'react-spring'

import useStore from 'store'
import { formatValue } from 'utils/formatters'

export const FormattedNumber = React.memo(
  ({
    amount,
    animate = false,
    className,
    minDecimals = 2,
    maxDecimals = 2,
    thousandSeparator = true,
    prefix = false,
    suffix = false,
    rounded = false,
    abbreviated = false,
  }: FormattedNumberProps) => {
    const enableAnimations = useStore((s) => s.enableAnimations)
    const prevAmountRef = useRef<number>(0)

    useEffect(() => {
      if (prevAmountRef.current !== Number(amount)) prevAmountRef.current = Number(amount)
    }, [amount])

    const springAmount = useSpring({
      number: Number(amount),
      from: { number: prevAmountRef.current },
      config: { duration: 1000 },
    })

    return (prevAmountRef.current === amount && amount === 0) || !animate || !enableAnimations ? (
      <span className={classNames('number', className)}>
        {formatValue(
          amount,
          minDecimals,
          maxDecimals,
          thousandSeparator,
          prefix,
          suffix,
          rounded,
          abbreviated,
        )}
      </span>
    ) : (
      <animated.span className={classNames('number', className)}>
        {springAmount.number.to((num) =>
          formatValue(
            num,
            minDecimals,
            maxDecimals,
            thousandSeparator,
            prefix,
            suffix,
            rounded,
            abbreviated,
          ),
        )}
      </animated.span>
    )
  },
)

FormattedNumber.displayName = 'FormattedNumber'
