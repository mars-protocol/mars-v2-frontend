import HealthBar from 'components/Account/HealthBar'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { ORACLE_DENOM } from 'constants/oracle'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountApr, calculateAccountBalanceValue } from 'utils/accounts'
import { ArrowChartLineUp } from 'components/Icons'
import { FormattedNumber } from 'components/FormattedNumber'

interface Props {
  account: Account
}

export default function AccountStats(props: Props) {
  const { data: prices } = usePrices()
  const positionBalance = useMemo(
    () => calculateAccountBalanceValue(props.account, prices),
    [props.account, prices],
  )
  const { health } = useHealthComputer(props.account)
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
  const apr = useMemo(
    () => calculateAccountApr(props.account, borrowAssetsData, lendingAssetsData, prices),
    [props.account, borrowAssetsData, lendingAssetsData, prices],
  )
  return (
    <div className='flex-wrap w-full'>
      <span className='flex items-center'>
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionBalance)}
          className='w-full text-xl'
        />
        <ArrowChartLineUp className='w-4 mr-1' />
        <FormattedNumber
          className='text-xs text-white/70'
          amount={apr.toNumber()}
          options={{ prefix: 'APR: ', suffix: '%', minDecimals: 2, maxDecimals: 2 }}
        />
      </span>
      <HealthBar health={health} classNames='mt-1' hasLabel />
    </div>
  )
}
