import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
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
      <DisplayCurrency className='inline text-xs' coin={props.pnl} isProfitOrLoss showZero />
    </Tooltip>
  )
}

type PnLTooltipProps = {
  realized: BNCoin
  unrealized: BNCoin
}

function PnLTooltip(props: PnLTooltipProps) {
  return (
    <div className='flex flex-col w-full gap-2'>
      {[props.realized, props.unrealized].map((coin, i) => (
        <div key={i} className='flex items-center w-full gap-8 space-between'>
          <Text className='mr-auto text-white/60' size='sm'>
            {i === 0 ? 'Realized' : 'Unrealized'} PnL
          </Text>
          <DisplayCurrency
            coin={coin}
            className='self-end text-sm text-end'
            isProfitOrLoss
            showZero
          />
        </div>
      ))}
    </div>
  )
}
