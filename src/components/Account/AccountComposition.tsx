import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'
import Text from 'components/Text'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import {
  calculateAccountApr,
  calculateAccountBalanceValue,
  calculateAccountBorrowRate,
  calculateAccountPnL,
  getAccountPositionValues,
} from 'utils/accounts'

interface Props {
  account: Account
  change?: AccountChange
}

interface ItemProps {
  title: string
  current: BigNumber
  change: BigNumber
  className?: string
  isDecrease?: boolean
  isPercentage?: boolean
}

export default function AccountComposition(props: Props) {
  const { account, change } = props
  const { data: prices } = usePrices()

  const [depositsBalance, lendsBalance, debtsBalance] = useMemo(
    () => getAccountPositionValues(account, prices),
    [account, prices],
  )
  const [depositsBalanceChange, lendsBalanceChange, debtsBalanceChange] = useMemo(
    () => (change ? getAccountPositionValues(change, prices) : [BN_ZERO, BN_ZERO, BN_ZERO]),
    [change, prices],
  )
  const totalBalance = useMemo(
    () => calculateAccountBalanceValue(account, prices),
    [account, prices],
  )
  const totalBalanceChange = useMemo(
    () => (change ? calculateAccountBalanceValue(change, prices) : BN_ZERO),
    [change, prices],
  )

  const balance = depositsBalance.plus(lendsBalance)
  const balanceChange = depositsBalanceChange.plus(lendsBalanceChange)
  const apr = calculateAccountApr(account, prices)
  const aprChange = change ? calculateAccountPnL(change, prices) : BN_ZERO
  const borrowRate = calculateAccountBorrowRate(account, prices)
  const borrowRateChange = change ? calculateAccountPnL(change, prices) : BN_ZERO

  return (
    <div className='w-full flex-wrap p-4'>
      <Item
        title='Total Position Value'
        current={balance}
        change={balance.plus(balanceChange)}
        className='pb-3'
      />
      <Item
        title='Total Debt'
        current={debtsBalance}
        change={debtsBalance.plus(debtsBalanceChange)}
        className='pb-3'
        isDecrease
      />
      <Item
        title='Total Balance'
        current={totalBalance}
        change={totalBalance.plus(totalBalanceChange)}
        className='border border-transparent border-y-white/20 py-3 font-bold'
      />
      <Item title='APR' current={apr} change={apr.plus(aprChange)} className='py-3' isPercentage />
      <Item
        title='Borrow Rate'
        current={borrowRate}
        change={borrowRate.plus(borrowRateChange)}
        isPercentage
        isDecrease
      />
    </div>
  )
}

function Item(props: ItemProps) {
  const { current, change } = props
  const increase = props.isDecrease ? current.isGreaterThan(change) : current.isLessThan(change)

  return (
    <div className={classNames('flex w-full flex-nowrap', props.className)}>
      <div className='flex flex-shrink items-center'>
        <Text size='sm' className='text-white/60'>
          {props.title}
        </Text>
      </div>
      <div className='flex flex-1 items-center justify-end gap-2'>
        {props.isPercentage ? (
          <FormattedNumber
            amount={current.toNumber()}
            options={{ suffix: '%', minDecimals: 2, maxDecimals: 2 }}
            className='text-sm'
            animate
          />
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, current)}
            className='text-sm'
          />
        )}
        {!current.isEqualTo(change) && (
          <>
            <span className={classNames('w-3', increase ? 'text-profit' : 'text-loss')}>
              <ArrowRight />
            </span>
            {props.isPercentage ? (
              <FormattedNumber
                amount={change.toNumber()}
                options={{ suffix: '%', minDecimals: 2, maxDecimals: 2 }}
                className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
                animate
              />
            ) : (
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, change)}
                className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
