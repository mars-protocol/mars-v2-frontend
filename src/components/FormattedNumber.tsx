import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from 'react-spring'

import useStore from 'store'
import { FormatOptions, formatValue } from 'utils/formatters'

interface Props {
  amount: number | string
  options?: FormatOptions
  className?: string
  animate?: boolean
}

export const FormattedNumber = React.memo((props: Props) => {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const prevAmountRef = useRef<number>(0)

  useEffect(() => {
    if (prevAmountRef.current !== Number(props.amount)) prevAmountRef.current = Number(props.amount)
  }, [props.amount])

  const springAmount = useSpring({
    number: Number(props.amount),
    from: { number: prevAmountRef.current },
    config: { duration: 1000 },
  })

  return (prevAmountRef.current === props.amount && props.amount === 0) ||
    !props.animate ||
    !enableAnimations ? (
    <span className={classNames('number', props.className)}>
      {formatValue(props.amount, {
        minDecimals: props.options?.minDecimals,
        maxDecimals: props.options?.maxDecimals,
        thousandSeparator: props.options?.thousandSeparator,
        prefix: props.options?.prefix,
        suffix: props.options?.suffix,
        rounded: props.options?.rounded,
        abbreviated: props.options?.abbreviated,
        decimals: props.options?.decimals,
      })}
    </span>
  ) : (
    <animated.span className={classNames('number', props.className)}>
      {springAmount.number.to((num) =>
        formatValue(num, {
          minDecimals: props.options?.minDecimals,
          maxDecimals: props.options?.maxDecimals,
          thousandSeparator: props.options?.thousandSeparator,
          prefix: props.options?.prefix,
          suffix: props.options?.suffix,
          rounded: props.options?.rounded,
          abbreviated: props.options?.abbreviated,
          decimals: props.options?.decimals,
        }),
      )}
    </animated.span>
  )
})

FormattedNumber.displayName = 'FormattedNumber'
