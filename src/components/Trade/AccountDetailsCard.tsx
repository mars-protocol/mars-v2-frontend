import Card from 'components/Card'
import useCurrentAccount from 'hooks/useCurrentAccount'
import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function AccountDetailsCard() {
  const account = useCurrentAccount()
  const { availableAssets: borrowAvailableAssets, accountBorrowedAssets } =
    useBorrowMarketAssetsTableData()
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const borrowAssetsData = [...borrowAvailableAssets, ...accountBorrowedAssets]
  const lendingAssetsData = [...lendingAvailableAssets, ...accountLentAssets]

  const tabs = (
    <div className={className.tabWrapper}>
      <div className={className.tab}>Balances</div>
    </div>
  )

  if (account && account.deposits.length)
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
