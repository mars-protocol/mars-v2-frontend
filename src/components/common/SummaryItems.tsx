import classNames from 'classnames'
import React from 'react'

import { FormattedNumber } from './FormattedNumber'
import Text from './Text'
import WarningMessages from './WarningMessages'

interface Props {
  items: SummaryItem[]
}

export default function SummaryItems(props: Props) {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {props.items.map((item) => (
        <React.Fragment key={item.title}>
          <Text className='text-white/60 text-sm'>{item.title}</Text>
          <span className='flex justify-end'>
            <WarningMessages messages={item.warningMessages || []} />
            <FormattedNumber
              className={classNames(
                'place-self-end text-sm',
                item.warningMessages?.length && 'text-warning',
              )}
              amount={item.amount}
              options={item.options}
            />
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}
