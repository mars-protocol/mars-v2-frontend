import { useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import useLiquidationPrice from 'hooks/prices/useLiquidationPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { LiquidationPriceKind } from 'utils/health_computer'
import { BN } from 'utils/helpers'
import { getPriceDecimals } from 'utils/formatters'

export const LIQ_META = {
  accessorKey: 'symbol',
  header: 'Liquidation Price',
  id: 'liqPrice',
}

interface Props {
  amount: number
  computeLiquidationPrice: (denom: string, kind: LiquidationPriceKind) => number | null
  denom: string
  type: PositionType
  account: Account
  isWhitelisted: boolean
}

export default function LiqPrice(props: Props) {
  const { denom, type, amount, account, computeLiquidationPrice, isWhitelisted } = props
  const hasDebt = account.debts.length > 0

  const liqPrice = useMemo(() => {
    if (type === 'vault' || amount === 0) return 0
    return computeLiquidationPrice(
      denom,
      type === 'borrow' ? 'debt' : type === 'perp' ? 'perp' : 'asset',
    )
  }, [amount, computeLiquidationPrice, denom, type])

  const { liquidationPrice } = useLiquidationPrice(liqPrice)

  const tooltipText = useMemo(() => {
    if (type === 'vault')
      return 'Liquidation prices cannot be calculated for farm positions. But a drop in price of the underlying assets can still cause a liquidation.'
    if (!isWhitelisted) return 'This asset is not collateral and can not be liquidated.'
    if (!hasDebt) return 'Your position cannot be liquidated as you currently have no debt.'
    return 'The position size is too small to liquidate the account, even if the price goes to $0.00.'
  }, [isWhitelisted, type, hasDebt])

  if (amount === 0)
    return (
      <Text size='xs' tag='div' className='flex items-center justify-end number'>
        -
      </Text>
    )

  if (!liqPrice || (liquidationPrice === 0 && liqPrice === 0))
    return (
      <Text size='xs' tag='div' className='flex items-center justify-end number'>
        N/A
        <Tooltip content={tooltipText} type='info' className='ml-1'>
          <InfoCircle className='w-3.5 h-3.5 text-white/40 hover:text-inherit' />
        </Tooltip>
      </Text>
    )

  return (
    <DisplayCurrency
      className='text-xs text-right number'
      coin={BNCoin.fromDenomAndBigNumber('usd', BN(liqPrice))}
      options={{
        abbreviated: false,
        maxDecimals: getPriceDecimals(liqPrice),
        minDecimals: getPriceDecimals(liqPrice),
      }}
      showDetailedPrice
    />
  )
}
