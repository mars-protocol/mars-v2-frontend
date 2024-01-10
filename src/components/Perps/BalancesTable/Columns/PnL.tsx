import DisplayCurrency from 'components/DisplayCurrency'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

export const PNL_META = { accessorKey: 'pnl', header: 'Total PnL', id: 'pnl' }

type Props = {
  pnl: BNCoin
}

export default function PnL(props: Props) {
  return (
    <Tooltip
      content={
        <PnLTooltip
          realized={BNCoin.fromDenomAndBigNumber('uusd', BN_ZERO)}
          unrealized={props.pnl}
        />
      }
      type='info'
      underline
    >
      <DisplayCurrency className='inline text-xs' coin={props.pnl} isProfitOrLoss />
    </Tooltip>
  )
}

type PnLTooltipProps = {
  realized: BNCoin
  unrealized: BNCoin
}

function PnLTooltip(props: PnLTooltipProps) {
  return (
    <div className='flex flex-col gap-2 w-full'>
      {[props.realized, props.unrealized].map((coin, i) => (
        <div key={i} className='flex w-full text-white/60 space-between items-center gap-8'>
          <Text className='mr-auto' size='sm'>
            {i === 0 ? 'Realized' : 'Unrealized'} PnL
          </Text>
          <DisplayCurrency coin={coin} className='self-end text-end' isProfitOrLoss />
        </div>
      ))}
    </div>
  )
}
