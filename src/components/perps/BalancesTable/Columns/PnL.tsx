import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'

export const PNL_META = { accessorKey: 'pnl.net.amount', header: 'Total PnL', id: 'pnl' }

type Props = {
  pnl: PerpPositionRow['pnl']
}

export default function PnL(props: Props) {
  return (
    <Tooltip content={<PnLTooltip {...props} />} type='info' underline>
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

function PnLTooltip(props: Props) {
  const basePrice = usePrice(props.pnl.realized.net.denom)

  const getBNCoin = useCallback(
    (amount: BigNumber) => BNCoin.fromDenomAndBigNumber(props.pnl.realized.net.denom, amount),
    [props.pnl.realized.net.denom],
  )

  const unrealizedCoins = useMemo(() => {
    return {
      net: getBNCoin(props.pnl.unrealized.net.div(basePrice)),
      price: getBNCoin(props.pnl.unrealized.price.div(basePrice)),
      funding: getBNCoin(props.pnl.unrealized.funding.div(basePrice)),
      fees: getBNCoin(props.pnl.unrealized.fees.div(basePrice)),
    } as PerpsPnLCoins
  }, [
    basePrice,
    getBNCoin,
    props.pnl.unrealized.fees,
    props.pnl.unrealized.funding,
    props.pnl.unrealized.net,
    props.pnl.unrealized.price,
  ])

  return (
    <div className='flex flex-col w-full gap-2 min-w-[280px]'>
      {[props.pnl.realized, unrealizedCoins].map((coins, i) => (
        <>
          <div key={i} className='flex items-center w-full gap-8 space-between'>
            <Text className='mr-auto text-white/60 font-bold' size='sm'>
              {i === 0 ? 'Realized' : 'Unrealized'} PnL
            </Text>
            <DisplayCurrency
              coin={coins.net}
              className='self-end text-sm text-end font-bold'
              isProfitOrLoss
              showSignPrefix
              showZero
            />
          </div>
          <PnLRow coin={coins.price} text='Price' />
          <PnLRow coin={coins.funding} text='Funding' className='text-white/60' showSignPrefix />
          <PnLRow coin={coins.fees} text='Fees' className='text-white/60' showSignPrefix />
          {i === 0 && <Divider className='my-2' />}
        </>
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
    <div className='flex items-center w-full gap-8 space-between pl-4'>
      <Text className='mr-auto text-white/60' size='sm'>
        {props.text}
      </Text>
      <DisplayCurrency
        coin={props.coin}
        className={classNames('self-end text-sm text-end', props.className)}
        showZero
        showSignPrefix={props.showSignPrefix}
      />
    </div>
  )
}
