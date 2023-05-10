'use client'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'

import DisplayCurrency from 'components/DisplayCurrency'
import { ArrowRight } from 'components/Icons'
import Text from 'components/Text'
import useStore from 'store'
import {
  calculateAccountApr,
  calculateAccountBalance,
  calculateAccountBorrowRate,
  calculateAccountDebt,
  calculateAccountPnL,
} from 'utils/accounts'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
  change?: AccountChange
}

interface ItemProps {
  title: string
  current: BigNumber
  change: BigNumber
  className?: string
}

export default function AccountComposition(props: Props) {
  const prices = useStore((s) => s.prices)
  const balance = calculateAccountBalance(props.account, prices)
  const balanceChange = props.change ? calculateAccountBalance(props.change, prices) : BN(0)
  const debtBalance = calculateAccountDebt(props.account, prices)
  const debtBalanceChange = props.change ? calculateAccountDebt(props.change, prices) : BN(0)
  const pnL = calculateAccountPnL(props.account, prices)
  const pnLChange = props.change ? calculateAccountPnL(props.change, prices) : BN(0)
  const apr = calculateAccountApr(props.account, prices)
  const aprChange = props.change ? calculateAccountPnL(props.change, prices) : BN(0)
  const borrowRate = calculateAccountBorrowRate(props.account, prices)
  const borrowRateChange = props.change ? calculateAccountPnL(props.change, prices) : BN(0)

  return (
    <div className='w-full flex-wrap p-4'>
      <Item
        title='Total Position Value'
        current={balance}
        change={balance.plus(balanceChange)}
        className='pb-3'
      />
      <Item
        title='Total Liabilities'
        current={debtBalance}
        change={debtBalance.plus(debtBalanceChange)}
        className='pb-3'
      />
      <Item
        title='Unrealized PnL'
        current={pnL}
        change={pnL.plus(pnLChange)}
        className='border border-transparent border-y-white/20 py-3'
      />
      <Item title='APR' current={apr} change={apr.plus(aprChange)} className='py-3' />
      <Item title='Borrow Rate' current={borrowRate} change={borrowRate.plus(borrowRateChange)} />
    </div>
  )
}

function Item(props: ItemProps) {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const increase = props.current.isLessThan(props.change)
  return (
    <div className={classNames('flex w-full flex-nowrap', props.className)}>
      <div className='flex flex-shrink items-center'>
        <Text size='sm' className='text-white/60'>
          {props.title}
        </Text>
      </div>
      <div className='flex flex-grow items-center justify-end gap-2'>
        <DisplayCurrency
          coin={{ amount: props.current.toString(), denom: baseCurrency.denom }}
          className='text-sm'
        />
        {!props.current.isEqualTo(props.change) && (
          <>
            <span className={classNames('w-3', increase ? 'text-profit' : 'text-loss')}>
              <ArrowRight />
            </span>
            <DisplayCurrency
              coin={{ amount: props.change.toString(), denom: baseCurrency.denom }}
              className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
            />
          </>
        )}
      </div>
    </div>
  )
}
