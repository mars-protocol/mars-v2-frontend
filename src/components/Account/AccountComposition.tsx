import BigNumber from 'bignumber.js'
import classNames from 'classnames'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'
import Text from 'components/Text'
import { BN_ZERO } from 'constants/math'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import {
  calculateAccountApr,
  calculateAccountBorrowRate,
  calculateAccountDebt,
  calculateAccountDeposits,
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
  const balance = calculateAccountDeposits(props.account, prices)
  const balanceChange = props.change ? calculateAccountDeposits(props.change, prices) : BN_ZERO
  const debtBalance = calculateAccountDebt(props.account, prices)
  const debtBalanceChange = props.change ? calculateAccountDebt(props.change, prices) : BN_ZERO
  const pnL = calculateAccountPnL(props.account, prices)
  const pnLChange = props.change ? calculateAccountPnL(props.change, prices) : BN_ZERO
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
        title='Total Liabilities'
        current={debtBalance}
        change={debtBalance.plus(debtBalanceChange)}
        className='pb-3'
        isBadIncrease
      />
      <Item
        title='Unrealized PnL'
        current={pnL}
        change={pnL.plus(pnLChange)}
        className='border border-transparent border-y-white/20 py-3'
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
  const baseCurrency = useStore((s) => s.baseCurrency)
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
            coin={new BNCoin({ amount: props.current.toString(), denom: baseCurrency.denom })}
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
                coin={new BNCoin({ amount: props.change.toString(), denom: baseCurrency.denom })}
                className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
