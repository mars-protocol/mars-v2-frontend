import { useMemo } from 'react'

import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import Card from 'components/Card'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function AccountDetailsCard() {
  const account = useCurrentAccount()
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

  const tabs = (
    <div className={className.tabWrapper}>
      <div className={className.tab}>Balances</div>
    </div>
  )

  if (account)
    return (
      <Card className='h-fit' title={tabs}>
        <AccountBalancesTable
          account={account}
          borrowingData={borrowAssetsData}
          lendingData={lendingAssetsData}
          tableBodyClassName='gradient-card-content'
        />
      </Card>
    )
}

const className = {
  tabWrapper: 'flex w-full items-center bg-white/10 pt-4 pl-4 font-semibold',
  tab: 'mr-4 pb-3 cursor-pointer select-none flex flex-row border-b-2 border-pink border-solid',
}