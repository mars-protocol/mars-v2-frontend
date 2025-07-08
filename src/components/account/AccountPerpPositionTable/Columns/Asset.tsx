import { ReactNode } from 'react'

import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import CloseLabel from 'components/perps/BalancesTable/Columns/CloseLabel'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import { demagnify } from 'utils/formatters'

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

function LabelAndValue(props: { label: string; children: ReactNode }) {
  const { label, children } = props

  return (
    <div className='flex items-center justify-between'>
      <Text size='sm' tag='div' className='text-white/60'>
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
      <Text
        tag='div'
        size='xs'
        className='flex items-center gap-2 no-wrap group/asset hover:cursor-help'
      >
        <AssetImage asset={asset} className='w-4 h-4' />
        <span className='pb-[1px] border-b border-white/40 border-dashed group-hover/asset:border-transparent'>
          {row.symbol}
        </span>
        {row.amount.isZero() ? (
          <CloseLabel />
        ) : (
          <TradeDirection tradeDirection={row.tradeDirection} type={row.type} />
        )}
      </Text>
    </Tooltip>
  )
}
