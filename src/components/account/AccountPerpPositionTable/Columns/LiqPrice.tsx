import { useEffect, useMemo, useState } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import useLiquidationPrice from 'hooks/useLiquidationPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { LiquidationPriceKind } from 'utils/health_computer'
import { BN } from 'utils/helpers'

export const LIQ_META = {
  accessorKey: 'symbol',
  header: 'Liq. Price',
  id: 'liqPrice',
  meta: { className: 'w-40' },
}

interface Props {
  computeLiquidationPrice: (denom: string, kind: LiquidationPriceKind) => number | null
  denom: string
  account: Account
}

export default function LiqPrice(props: Props) {
  const { denom, computeLiquidationPrice } = props
  const [lastLiquidationPrice, setLastLiquidationPrice] = useState<number | null>(null)

  const liqPrice = useMemo(() => {
    return computeLiquidationPrice(denom, 'asset')
  }, [computeLiquidationPrice, denom])

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
            'The position size is too small to liquidate the account, even if the price goes to $0.00.'
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
