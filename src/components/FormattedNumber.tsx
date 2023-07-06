import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { animated, useSpring } from 'react-spring'
import isEqual from 'lodash.isequal'

import useStore from 'store'
import { formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  amount: BigNumber
  options?: FormatOptions
  className?: string
  animate?: boolean
}

export const FormattedNumber = React.memo(
  (props: Props) => {
    const enableAnimations = useStore((s) => s.enableAnimations)
    const prevAmountRef = useRef<BigNumber>(BN(0))

    useEffect(() => {
      if (!prevAmountRef.current.isEqualTo(props.amount)) prevAmountRef.current = props.amount
    }, [props.amount])

    const springAmount = useSpring({
      number: props.amount.toNumber(),
      from: { number: prevAmountRef.current.toNumber() },
      config: { duration: 1000 },
    })

    if (
      (prevAmountRef.current.isEqualTo(props.amount) && props.amount.isZero()) ||
      !props.animate ||
      !enableAnimations
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
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
)

FormattedNumber.displayName = 'FormattedNumber'
