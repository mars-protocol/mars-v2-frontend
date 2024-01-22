import classNames from 'classnames'
import { ReactNode } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import { BN_ZERO } from 'constants/math'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'
export const ASSET_META = { accessorKey: 'symbol', header: 'Asset', id: 'symbol' }

interface Props {
  row: AccountPerpRow
}

function LabelAndValue(props: { label: string; children: ReactNode; className?: string }) {
  const { label, children, className } = props

  return (
    <div className='flex items-center justify-between'>
      <Text size='sm' className='text-white/60'>
        {label}
      </Text>
      {children}
    </div>
  )
}

function TooltipContent(props: Props) {
  const { row } = props
  const assets = usePerpsEnabledAssets()
  const asset = assets.find((asset) => asset.symbol === row.symbol)
  const isPositive = row.pnl.amount.isGreaterThan(0)
  const isNegative = row.pnl.amount.isLessThan(0)
  if (!asset) return null

  return (
    <div className='flex flex-col flex-wrap gap-1 w-50'>
      <LabelAndValue label='Entry Price'>
        <FormattedNumber amount={row.entryPrice.toNumber()} options={{ prefix: '$' }} />
      </LabelAndValue>
      <LabelAndValue label='Size'>
        <Text size='sm'>{demagnify(row.size, asset)}</Text>
      </LabelAndValue>
      <LabelAndValue label='Realized PnL'>
        <DisplayCurrency
          className='text-sm text-right number'
          coin={BNCoin.fromDenomAndBigNumber('usd', BN_ZERO)}
          showZero
        />
      </LabelAndValue>
      <LabelAndValue label='Unrealized PnL'>
        <DisplayCurrency
          className={classNames(
            'text-sm text-right number',
            isNegative && 'text-loss',
            isPositive && 'text-profit',
          )}
          coin={row.pnl}
          options={{ abbreviated: false, prefix: isPositive ? '+' : isNegative ? '-' : '' }}
          showZero
        />
      </LabelAndValue>
    </div>
  )
}

export default function Asset(props: Props) {
  const { row } = props
  return (
    <Tooltip content={<TooltipContent row={row} />} type='info'>
      <Text size='xs' className='flex items-center gap-1 no-wrap group/asset hover:cursor-help'>
        <span className='pb-[1px] border-b border-white/40 border-dashed group-hover/asset:border-transparent'>
          {row.symbol}
        </span>
        <TradeDirection tradeDirection={row.tradeDirection} />
      </Text>
    </Tooltip>
  )
}
