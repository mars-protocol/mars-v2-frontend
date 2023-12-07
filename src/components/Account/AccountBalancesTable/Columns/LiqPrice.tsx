import { useEffect, useMemo, useState } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { InfoCircle } from 'components/Icons'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import useLiquidationPrice from 'hooks/useLiquidationPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { LiquidationPriceKind } from 'utils/health_computer'
import { BN } from 'utils/helpers'

export const LIQ_META = {
  accessorKey: 'symbol',
  header: 'Liquidation Price',
  id: 'liqPrice',
  meta: { className: 'w-40' },
}

interface Props {
  amount: number
  computeLiquidationPrice: (denom: string, kind: LiquidationPriceKind) => number | null
  denom: string
  type: 'deposits' | 'borrowing' | 'lending' | 'vault'
}

export default function LiqPrice(props: Props) {
  const { denom, type, amount, computeLiquidationPrice } = props
  const [lastLiquidationPrice, setLastLiquidationPrice] = useState<number | null>(null)

  const liqPrice = useMemo(() => {
    if (type === 'vault' || amount === 0) return 0
    return computeLiquidationPrice(denom, type === 'borrowing' ? 'debt' : 'asset')
  }, [amount, computeLiquidationPrice, denom, type])

  const { liquidationPrice } = useLiquidationPrice(liqPrice)

  useEffect(() => {
    if (lastLiquidationPrice !== liqPrice && liqPrice !== null) setLastLiquidationPrice(liqPrice)
  }, [liqPrice, lastLiquidationPrice])

  if (!lastLiquidationPrice || (liquidationPrice === 0 && lastLiquidationPrice === 0))
    return (
      <Text size='xs' className='flex items-center justify-end number'>
        N/A
        <Tooltip
          content={
            type === 'vault'
              ? 'Liquidation prices cannot be calculated for farm positions. But it a drop in price of the underlying assets can still cause a liquidation.'
              : 'The position size is too small to liquidate the account, even if the price goes to $0.00.'
          }
          type='info'
          className='ml-1'
        >
          <InfoCircle className='w-3.5 h-3.5 text-white/40 hover:text-inherit' />
        </Tooltip>
      </Text>
    )

  return (
    <DisplayCurrency
      className='text-xs text-right number'
      coin={BNCoin.fromDenomAndBigNumber('usd', BN(lastLiquidationPrice))}
      options={{ abbreviated: false }}
    />
  )
}