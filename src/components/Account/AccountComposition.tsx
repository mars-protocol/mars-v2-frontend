import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'
import Text from 'components/Text'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import {
  calculateAccountApr,
  calculateAccountBalanceValue,
  getAccountPositionValues,
} from 'utils/accounts'

interface Props {
  account: Account
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
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { account } = props
  const hasChanged = !!updatedAccount
  const { data: prices } = usePrices()
  const { availableAssets: borrowAvailableAssets, accountBorrowedAssets } =
    useBorrowMarketAssetsTableData()
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const borrowAssetsData = useMemo(
    () => [...borrowAvailableAssets, ...accountBorrowedAssets],
    [borrowAvailableAssets, accountBorrowedAssets],
  )
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  const [depositsBalance, lendsBalance, debtsBalance, vaultsBalance] = useMemo(
    () => getAccountPositionValues(account, prices),
    [account, prices],
  )
  const positionValue = depositsBalance.plus(lendsBalance).plus(vaultsBalance)

  const [updatedPositionValue, updatedDebtsBalance] = useMemo(() => {
    const [updatedDepositsBalance, updatedLendsBalance, updatedDebtsBalance, updatedVaultsBalance] =
      updatedAccount
        ? getAccountPositionValues(updatedAccount, prices)
        : [BN_ZERO, BN_ZERO, BN_ZERO]

    const updatedPositionValue = updatedDepositsBalance
      .plus(updatedLendsBalance)
      .plus(updatedVaultsBalance)

    return [updatedPositionValue, updatedDebtsBalance]
  }, [updatedAccount, prices])

  const totalBalance = useMemo(
    () => calculateAccountBalanceValue(account, prices),
    [account, prices],
  )
  const updatedTotalBalance = useMemo(
    () => (updatedAccount ? calculateAccountBalanceValue(updatedAccount, prices) : BN_ZERO),
    [updatedAccount, prices],
  )

  const apr = useMemo(
    () => calculateAccountApr(account, borrowAssetsData, lendingAssetsData, prices),
    [account, borrowAssetsData, lendingAssetsData, prices],
  )
  const updatedApr = useMemo(
    () =>
      updatedAccount
        ? calculateAccountApr(updatedAccount, borrowAssetsData, lendingAssetsData, prices)
        : BN_ZERO,
    [updatedAccount, borrowAssetsData, lendingAssetsData, prices],
  )

  return (
    <div className='flex-wrap w-full p-4 pb-1'>
      <Item
        title='Total Position Value'
        current={positionValue}
        change={hasChanged ? updatedPositionValue : positionValue}
        className='pb-3'
      />
      <Item
        title='Total Debt'
        current={debtsBalance}
        change={hasChanged ? updatedDebtsBalance : debtsBalance}
        className='pb-3'
        isDecrease
      />
      <Item
        title='Total Balance'
        current={totalBalance}
        change={hasChanged ? updatedTotalBalance : totalBalance}
        className='py-3 font-bold border border-transparent border-y-white/20'
      />
      <Item
        title='APR'
        current={apr}
        change={hasChanged ? updatedApr : apr}
        className='py-3'
        isPercentage
      />
    </div>
  )
}

function Item(props: ItemProps) {
  const { current, change } = props
  const increase = props.isDecrease ? current.isGreaterThan(change) : current.isLessThan(change)

  return (
    <div className={classNames('flex w-full flex-nowrap', props.className)}>
      <div className='flex items-center flex-shrink'>
        <Text size='sm' className='text-white/60'>
          {props.title}
        </Text>
      </div>
      <div className='flex items-center justify-end flex-1 gap-2'>
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
        {current.toFixed(2) !== change.toFixed(2) && (
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
