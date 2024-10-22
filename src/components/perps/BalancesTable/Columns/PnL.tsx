import classNames from 'classnames'
import React from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { BNCoin } from 'types/classes/BNCoin'

export const PNL_META = {
  accessorKey: 'pnl.net.amount',
  header: 'Total PnL',
  id: 'pnl',
  meta: { className: 'min-w-30' },
}

type Props = {
  pnl: PerpsPnL
  type: PerpsPosition['type']
}

export default function PnL(props: Props) {
  if (props.type === 'limit')
    return (
      <Tooltip
        content={<PnLTooltipLimitOrder {...props} />}
        type='info'
        underline
        className='ml-auto w-min'
      >
        <DisplayCurrency
          className='inline text-xs'
          coin={props.pnl.net}
          isProfitOrLoss
          showSignPrefix
          showZero
        />
      </Tooltip>
    )
  return (
    <Tooltip content={<PnLTooltip {...props} />} type='info' underline className='ml-auto w-min'>
      <DisplayCurrency
        className='inline text-xs'
        coin={props.pnl.net}
        isProfitOrLoss
        showSignPrefix
        showZero
      />
    </Tooltip>
  )
}

function PnLTooltipLimitOrder(props: Props) {
  return (
    <div className='flex flex-col w-full gap-2 min-w-[280px]'>
      <div className='flex items-center w-full gap-8 space-between'>
        <Text className='mr-auto font-bold text-white/60' size='sm'>
          Keeper Fee
        </Text>
        <DisplayCurrency
          coin={props.pnl.net}
          className='self-end text-sm font-bold text-end'
          isProfitOrLoss
          showSignPrefix
          showZero
        />
      </div>
    </div>
  )
}

function PnLTooltip(props: Props) {
  return (
    <div className='flex flex-col w-full gap-2 min-w-[280px]'>
      {[props.pnl.realized, props.pnl.unrealized].map((coins, i) => (
        <React.Fragment key={i}>
          <div className='flex items-center w-full gap-8 space-between'>
            <Text className='mr-auto font-bold text-white/60' size='sm'>
              {i === 0 ? 'Realized' : 'Unrealized'} PnL
            </Text>
            <DisplayCurrency
              coin={coins.net}
              className='self-end text-sm font-bold text-end'
              isProfitOrLoss
              showSignPrefix
              showZero
            />
          </div>
          <PnLRow coin={coins.price} text='Price' showSignPrefix />
          <PnLRow coin={coins.funding} text='Funding' className='text-white/60' showSignPrefix />
          <PnLRow
            coin={coins.fees}
            text={i === 1 ? 'Closing fee' : 'Fees'}
            className='text-white/60'
            showSignPrefix
          />
          {i === 0 && <Divider className='my-2' />}
        </React.Fragment>
      ))}
    </div>
  )
}

type PnLRowProps = {
  coin: BNCoin
  text: string
  showSignPrefix?: boolean
  className?: string
}

function PnLRow(props: PnLRowProps) {
  return (
    <div className='flex items-center w-full gap-8 pl-4 space-between'>
      <Text className='mr-auto text-white/60' size='sm'>
        {props.text}
      </Text>
      <DisplayCurrency
        coin={props.coin}
        className={classNames('self-end text-sm text-end', props.className)}
        showZero
        showSignPrefix={props.showSignPrefix}
        options={{ abbreviated: false }}
      />
    </div>
  )
}
