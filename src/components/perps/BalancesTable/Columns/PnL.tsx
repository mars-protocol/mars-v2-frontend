import classNames from 'classnames'
import { Fragment, useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { BNCoin } from 'types/classes/BNCoin'
import PnLDisplay from 'components/common/PnLDisplay'
import { BN_ZERO } from 'constants/math'
import { BN } from 'utils/helpers'

export const PNL_META = {
  accessorKey: 'pnl.net.amount',
  header: 'Total PnL',
  id: 'pnl',
  meta: { className: 'min-w-40 w-40' },
}

type Props = {
  pnl: PerpsPnL
  type: PerpsPosition['type']
  position: PerpsPosition
}

export default function PnL(props: Props) {
  const { pnl, position } = props

  const pnlPercentage = useMemo(() => {
    if (!position || !position.amount || pnl.net.amount.isZero()) return BN_ZERO

    const entryValue = BN(position.amount).abs().times(position.entryPrice)
    return BN(pnl.net.amount).div(entryValue).times(100)
  }, [position, pnl.net.amount])

  if (props.type === 'limit') {
    return (
      <Tooltip
        content={<PnLTooltipLimitOrder {...props} />}
        type='info'
        underline
        className='ml-auto w-min'
      >
        <PnLDisplay
          pnlAmount={pnl.net.amount}
          pnlPercentage={pnlPercentage}
          baseDenom={pnl.net.denom}
          className='text-xs'
        />
      </Tooltip>
    )
  }

  return (
    <Tooltip content={<PnLTooltip {...props} />} type='info' underline className='ml-auto w-min'>
      <PnLDisplay
        pnlAmount={pnl.net.amount}
        pnlPercentage={pnlPercentage}
        baseDenom={pnl.net.denom}
        className='text-xs'
      />
    </Tooltip>
  )
}

function PnLTooltipLimitOrder(props: Props) {
  return (
    <div className='flex flex-col w-full gap-2 min-w-70'>
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
    <div className='flex flex-col w-full gap-2 min-w-70'>
      {[props.pnl.realized, props.pnl.unrealized].map((coins, i) => (
        <Fragment key={i}>
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
        </Fragment>
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
