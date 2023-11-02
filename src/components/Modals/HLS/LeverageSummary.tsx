import React, { useMemo } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'
import useBorrowAsset from 'hooks/useBorrowAsset'

interface Props {
  asset: Asset
  positionValue: BigNumber
}

export default function LeverageSummary(props: Props) {
  const borrowAsset = useBorrowAsset(props.asset.denom)

  const items: { title: string; amount: number; options: FormatOptions }[] = useMemo(() => {
    return [
      // TODO: Get APY numbers
      {
        title: 'APY',
        amount: 0,
        options: { suffix: '%', minDecimals: 1, maxDecimals: 1 },
      },
      {
        title: `Borrow APR ${props.asset.symbol}`,
        amount: borrowAsset?.borrowRate || 0,
        options: { suffix: '%', minDecimals: 2, maxDecimals: 2 },
      },
      {
        title: 'Total Position Size',
        amount: props.positionValue.toNumber(),
        options: { prefix: '$' },
      },
    ]
  }, [borrowAsset?.borrowRate, props.asset.symbol, props.positionValue])

  return (
    <div className='grid grid-cols-2 gap-2'>
      {items.map((item) => (
        <React.Fragment key={item.title}>
          <Text className='text-white/60 text-xs'>{item.title}</Text>
          <FormattedNumber
            className='place-self-end text-xs'
            amount={item.amount}
            options={item.options}
          />
        </React.Fragment>
      ))}
    </div>
  )
}
