import BigNumber from 'bignumber.js'
import classNames from 'classnames'

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
  calculateAccountDebtValue,
  calculateAccountDepositsValue,
  calculateAccountPnL,
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
  isBadIncrease?: boolean
  isPercentage?: boolean
}

export default function AccountComposition(props: Props) {
  const { data: prices } = usePrices()
  const balance = calculateAccountDepositsValue(props.account, prices)
  const balanceChange = props.change ? calculateAccountDepositsValue(props.change, prices) : BN_ZERO
  const debtBalance = calculateAccountDebtValue(props.account, prices)
  const debtBalanceChange = props.change ? calculateAccountDebtValue(props.change, prices) : BN_ZERO
  const totalBalance = calculateAccountBalanceValue(props.account, prices)
  const totalBalanceChange = props.change
    ? calculateAccountBalanceValue(props.change, prices)
    : BN_ZERO
  const apr = calculateAccountApr(props.account, prices)
  const aprChange = props.change ? calculateAccountPnL(props.change, prices) : BN_ZERO
  const borrowRate = calculateAccountBorrowRate(props.account, prices)
  const borrowRateChange = props.change ? calculateAccountPnL(props.change, prices) : BN_ZERO

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
        current={debtBalance}
        change={debtBalance.plus(debtBalanceChange)}
        className='pb-3'
        isBadIncrease
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
        isBadIncrease
      />
    </div>
  )
}

function Item(props: ItemProps) {
  const increase = props.isBadIncrease
    ? props.current.isGreaterThan(props.change)
    : props.current.isLessThan(props.change)
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
            amount={props.current.toNumber()}
            options={{ suffix: '%', minDecimals: 2, maxDecimals: 2 }}
            className='text-sm'
            animate
          />
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, props.current)}
            className='text-sm'
          />
        )}
        {!props.current.isEqualTo(props.change) && (
          <>
            <span className={classNames('w-3', increase ? 'text-profit' : 'text-loss')}>
              <ArrowRight />
            </span>
            {props.isPercentage ? (
              <FormattedNumber
                amount={props.change.toNumber()}
                options={{ suffix: '%', minDecimals: 2, maxDecimals: 2 }}
                className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
                animate
              />
            ) : (
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, props.change)}
                className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
