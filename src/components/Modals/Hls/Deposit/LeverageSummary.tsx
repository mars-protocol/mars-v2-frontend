import { useMemo } from 'react'

import SummaryItems from 'components/common/SummaryItems'
import useMarket from 'hooks/markets/useMarket'

interface Props {
  asset: Asset
  positionValue: BigNumber
  apy: number
}

export default function LeverageSummary(props: Props) {
  const market = useMarket(props.asset.denom)

  const items: SummaryItem[] = useMemo(() => {
    return [
      {
        title: 'APY',
        amount: props.apy,
        options: { suffix: '%', minDecimals: 2, maxDecimals: 2 },
      },
      {
        title: `Borrow APR ${props.asset.symbol}`,
        amount: market?.apy.borrow || 0,
        options: { suffix: '%', minDecimals: 2, maxDecimals: 2 },
      },
      {
        title: 'Total Position Size',
        amount: props.positionValue.toNumber(),
        options: { prefix: '$' },
      },
    ]
  }, [market?.apy.borrow, props.apy, props.asset.symbol, props.positionValue])

  return <SummaryItems items={items} />
}
