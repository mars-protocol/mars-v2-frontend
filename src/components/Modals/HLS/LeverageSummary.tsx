import React, { useMemo } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'

interface Props {
  asset: Asset
}

export default function LeverageSummary(props: Props) {
  const items: { title: string; amount: number; options: FormatOptions }[] = useMemo(() => {
    return [
      {
        title: 'APY',
        amount: 0,
        options: { suffix: '%', minDecimals: 1, maxDecimals: 1 },
      },
      {
        title: `Borrow APR ${props.asset.symbol}`,
        amount: 0,
        options: { suffix: '%', minDecimals: 1, maxDecimals: 1 },
      },
      {
        title: 'Total Position Size',
        amount: 0,
        options: { prefix: '$' },
      },
    ]
  }, [props.asset.symbol])

  return (
    <div className='grid grid-cols-2'>
      {items.map((item) => (
        <React.Fragment key={item.title}>
          <Text className='text-white/60'>{item.title}</Text>
          <FormattedNumber className='place-self-end' amount={item.amount} options={item.options} />
        </React.Fragment>
      ))}
    </div>
  )
}
