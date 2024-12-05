import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'

export const PNL_META = { id: 'pnl', header: 'Total PnL', meta: { className: 'w-20' } }

interface Props {
  pnl: PerpsPnL
}

export default function TotalPnL(props: Props) {
  const { pnl } = props

  return (
    <Tooltip content={<PnLTooltip {...props} />} type='info' underline className='ml-auto w-min'>
      <DisplayCurrency
        className='text-xs text-right number'
        coin={pnl.net}
        options={{ abbreviated: false }}
        isProfitOrLoss
        showSignPrefix
        showZero
      />
    </Tooltip>
  )
}

function PnLTooltip(props: Props) {
  return (
    <div className='flex flex-col w-full gap-2 min-w-[120px]'>
      <div className='flex items-center w-full gap-8 space-between'>
        <Text className='mr-auto' size='xs'>
          Realized PnL
        </Text>
        <DisplayCurrency
          coin={props.pnl.realized.net}
          className='self-end text-xs text-end'
          isProfitOrLoss
          showSignPrefix
          showZero
        />
      </div>
      <div className='flex items-center w-full gap-8 space-between'>
        <Text className='mr-auto' size='xs'>
          Unrealized PnL
        </Text>
        <DisplayCurrency
          coin={props.pnl.unrealized.net}
          className='self-end text-xs text-end'
          isProfitOrLoss
          showSignPrefix
          showZero
        />
      </div>
    </div>
  )
}
