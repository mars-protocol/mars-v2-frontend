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
    <div className='flex items-center w-full pt-4 pl-4 font-semibold bg-white/10'>
      <div className='flex flex-row pb-3 mr-4 border-b-2 border-solid select-none hover:cursor-pointer border-pink'>
        Balances
      </div>
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
