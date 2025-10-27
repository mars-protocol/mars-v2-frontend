import { useMemo } from 'react'

import AccountBalancesTable from 'components/account/AccountBalancesTable'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

export default function AccountDetailsCard() {
  const account = useCurrentAccount()
  const data = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  if (account)
    return (
      <div className='order-2 w-full max-w-full overflow-hidden md:order-3'>
        <AccountBalancesTable
          account={account}
          borrowingData={borrowAssetsData}
          lendingData={lendingAssetsData}
          tableBodyClassName=''
          showLiquidationPrice
        />
      </div>
    )
}
