import React, { useMemo } from 'react'

import SummaryItems from 'components/common/SummaryItems'
import useBorrowAsset from 'hooks/useBorrowAsset'

interface Props {
  asset: Asset
  positionValue: BigNumber
  apy: number
}

export default function LeverageSummary(props: Props) {
  const borrowAsset = useBorrowAsset(props.asset.denom)

  const items: SummaryItem[] = useMemo(() => {
    return [
      {
        title: 'APY',
        amount: props.apy,
        options: { suffix: '%', minDecimals: 2, maxDecimals: 2 },
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
  }, [borrowAsset?.borrowRate, props.apy, props.asset.symbol, props.positionValue])

  return <SummaryItems items={items} />
}
