import React, { useMemo } from 'react'

import SummaryItems from 'components/SummaryItems'
import useBorrowAsset from 'hooks/useBorrowAsset'

interface Props {
  asset: Asset
  positionValue: BigNumber
}

export default function LeverageSummary(props: Props) {
  const borrowAsset = useBorrowAsset(props.asset.denom)

  const items: SummaryItem[] = useMemo(() => {
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

  return <SummaryItems items={items} />
}
