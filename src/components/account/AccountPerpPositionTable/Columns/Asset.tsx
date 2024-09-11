import { ReactNode } from 'react'

import usePerpsEnabledAssets from '../../../../hooks/assets/usePerpsEnabledAssets'
import { demagnify } from '../../../../utils/formatters'
import AssetImage from '../../../common/assets/AssetImage'
import DisplayCurrency from '../../../common/DisplayCurrency'
import { FormattedNumber } from '../../../common/FormattedNumber'
import Text from '../../../common/Text'
import { Tooltip } from '../../../common/Tooltip'
import TradeDirection from '../../../perps/BalancesTable/Columns/TradeDirection'

export const ASSET_META = {
  accessorKey: 'symbol',
  header: 'Asset',
  id: 'symbol',
  meta: { className: 'min-w-30 w-30' },
}

interface Props {
  row: AccountPerpRow
}

interface TooltipProps {
  row: AccountPerpRow
  asset: Asset
}

function LabelAndValue(props: { label: string; children: ReactNode; className?: string }) {
  const { label, children } = props

  return (
    <div className='flex items-center justify-between'>
      <Text size='sm' className='text-white/60'>
        {label}
      </Text>
      {children}
    </div>
  )
}

function TooltipContent(props: TooltipProps) {
  const { row, asset } = props

  return (
    <div className='flex flex-col flex-wrap gap-1 w-50'>
      <LabelAndValue label='Entry Price'>
        <FormattedNumber amount={row.entryPrice.toNumber()} options={{ prefix: '$' }} />
      </LabelAndValue>
      <LabelAndValue label='Size'>
        <Text size='sm'>{demagnify(row.amount, asset)}</Text>
      </LabelAndValue>
      <LabelAndValue label='Realized PnL'>
        <DisplayCurrency
          className='text-sm text-right number'
          coin={row.pnl.realized.net}
          showZero
          isProfitOrLoss
          showSignPrefix
        />
      </LabelAndValue>
      <LabelAndValue label='Unrealized PnL'>
        <DisplayCurrency
          coin={row.pnl.unrealized.net}
          options={{ abbreviated: false }}
          showZero
          isProfitOrLoss
          showSignPrefix
        />
      </LabelAndValue>
    </div>
  )
}

export default function Asset(props: Props) {
  const { row } = props
  const assets = usePerpsEnabledAssets()
  const asset = assets.find((asset) => asset.symbol === row.symbol)
  if (!asset) return null

  return (
    <Tooltip content={<TooltipContent row={row} asset={asset} />} type='info'>
      <Text size='xs' className='flex items-center gap-2 no-wrap group/asset hover:cursor-help'>
        <AssetImage asset={asset} className='w-4 h-4' />
        <span className='pb-[1px] border-b border-white/40 border-dashed group-hover/asset:border-transparent'>
          {row.symbol}
        </span>
        <TradeDirection tradeDirection={row.tradeDirection} />
      </Text>
    </Tooltip>
  )
}
