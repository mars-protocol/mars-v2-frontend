import { useMemo } from 'react'

import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import Card from 'components/Card'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function AccountDetailsCard() {
  const account = useCurrentAccount()
  const { data } = useBorrowMarketAssetsTableData(false)
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  if (account)
    return (
      <Card className='h-fit' title='Balances'>
        <AccountBalancesTable
          account={account}
          borrowingData={borrowAssetsData}
          lendingData={lendingAssetsData}
          tableBodyClassName='gradient-card-content'
        />
      </Card>
    )
}
