import classNames from 'classnames'
import React from 'react'

import _ from 'lodash'
import { formatValue } from 'utils/formatters'

interface Props {
  amount: number
  options?: FormatOptions
  className?: string
  parentheses?: boolean
  smallerThanThreshold?: boolean
}

export const FormattedNumber = React.memo(
  (props: Props) => {
    let options = props.options
    const smallerThanThreshold = props.smallerThanThreshold

    if (smallerThanThreshold) {
      if (!options) {
        options = { prefix: '< ' }
      } else {
        options = {
          ...options,
          prefix:
            options.prefix && options.prefix.substring(0, 1) !== '<' ? `< ${options.prefix}` : '< ',
        }
      }
    }

    return (
      <span
        className={classNames(
          'number inline-block',
          props.parentheses && 'before:content-["("] after:content-[")"]',
          props.className,
        )}
      >
        {formatValue(props.amount.toString(), options)}
      </span>
    )
  },
  (prevProps, nextProps) => _.isEqual(prevProps, nextProps),
)

FormattedNumber.displayName = 'FormattedNumber'
