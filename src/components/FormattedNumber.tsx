import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from 'react-spring'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import { formatValue } from 'utils/formatters'

interface Props {
  amount: number
  options?: FormatOptions
  className?: string
  animate?: boolean
}

export const FormattedNumber = React.memo(
  (props: Props) => {
    const [reduceMotion] = useLocalStorage<boolean>(
      REDUCE_MOTION_KEY,
      DEFAULT_SETTINGS.reduceMotion,
    )
    const prevAmountRef = useRef<number>(0)

    useEffect(() => {
      if (prevAmountRef.current !== props.amount) prevAmountRef.current = props.amount
    }, [props.amount])

    const springAmount = useSpring({
      number: props.amount,
      from: { number: prevAmountRef.current },
      config: { duration: 1000 },
    })

    if (
      (prevAmountRef.current === props.amount && props.amount === 0) ||
      !props.animate ||
      reduceMotion
    )
      return (
        <span className={classNames('number', props.className)}>
          {formatValue(props.amount.toString(), props.options)}
        </span>
      )

    return (
      <animated.span className={classNames('number', props.className)}>
        {springAmount.number.to((num) => formatValue(num, props.options))}
      </animated.span>
    )
  },
  (prevProps, nextProps) => prevProps.amount === nextProps.amount,
)

FormattedNumber.displayName = 'FormattedNumber'
