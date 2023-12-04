import React, { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import useLiquidationPrice from 'hooks/useLiquidationPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { LiquidationPriceKind } from 'utils/health_computer'
import { BN } from 'utils/helpers'

export const LIQ_META = { accessorKey: 'symbol', header: 'Liquidation Price', id: 'liqPrice' }

interface Props {
  amount: number
  computeLiquidationPrice: (denom: string, kind: LiquidationPriceKind) => number | null
  denom: string
  type: 'deposits' | 'borrowing' | 'lending' | 'vault'
}

export default function LiqPrice(props: Props) {
  const { denom, type, amount, computeLiquidationPrice } = props

  const liqPrice = useMemo(() => {
    if (type === 'vault' || amount === 0) return null
    return computeLiquidationPrice(denom, type === 'borrowing' ? 'debt' : 'asset')
  }, [amount, computeLiquidationPrice, denom, type])

  const { liquidationPrice } = useLiquidationPrice(liqPrice)

  if (liquidationPrice === null) return null
  if (liquidationPrice === 0) return <span className='text-xs text-right number'>-</span>

  return (
    <DisplayCurrency
      className='text-xs text-right number'
      coin={BNCoin.fromDenomAndBigNumber('usd', BN(liquidationPrice))}
    />
  )
}
