import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'

interface Props {
  items: SummaryItem[]
}

export default function SummaryItems(props: Props) {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {props.items.map((item) => (
        <React.Fragment key={item.title}>
          <Text className='text-white/60 text-sm'>{item.title}</Text>
          <FormattedNumber
            className='place-self-end text-sm'
            amount={item.amount}
            options={item.options}
          />
        </React.Fragment>
      ))}
    </div>
  )
}
