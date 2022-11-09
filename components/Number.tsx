import isEqual from 'lodash.isequal'
import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from 'react-spring'

import { formatValue } from 'utils/formatters'

interface NumberProps {
  amount: number
  animate?: boolean
  minDecimals?: number
  maxDecimals?: number
  thousandSeparator?: boolean
  prefix?: boolean | string
  suffix?: boolean | string
  rounded?: boolean
  abbreviated?: boolean
}

const Number = ({
  amount,
  animate = false,
  minDecimals = 2,
  maxDecimals = 2,
  thousandSeparator = true,
  prefix = false,
  suffix = false,
  rounded = false,
  abbreviated = false,
}: NumberProps) => {
  const prevAmountRef = useRef<number>(0)

  useEffect(() => {
    if (prevAmountRef.current !== amount) prevAmountRef.current = amount
  }, [amount])

  const springAmount = useSpring({
    number: amount,
    from: { number: prevAmountRef.current },
    config: { duration: 1000 },
  })

  return (prevAmountRef.current === amount && amount === 0) || !animate ? (
    <span className='number'>
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
    <animated.span className='number'>
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
}

const amountsAreEqual = (prevProps: NumberProps, nextProps: NumberProps) => {
  return isEqual(prevProps, nextProps)
}

export default React.memo(Number, amountsAreEqual)
