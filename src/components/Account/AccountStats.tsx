import HealthBar from 'components/Account/HealthBar'
import { useMemo } from 'react'

import AccountHealth from 'components/Account/AccountHealth'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowChartLineUp } from 'components/Icons'
import { ORACLE_DENOM } from 'constants/oracle'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountApr, calculateAccountBalanceValue } from 'utils/accounts'

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
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionBalance)}
        className='w-full text-xl'
      />
      <div className='mt-1 flex w-full items-center'>
        <HealthBar health={healthFactor} classNames='w-[140px]' hasLabel />
      </div>
    </div>
  )
}
