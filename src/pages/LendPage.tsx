import LendingMarketsTable from 'components/Earn/Lend/LendingMarketsTable'
import Tab from 'components/Earn/Tab'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function LendPage() {
  const { accountLentAssets, availableAssets } = useLendingMarketAssetsTableData()

  return (
    <div className='flex w-full flex-wrap gap-4'>
      <Tab />
      <LendingMarketsTable data={accountLentAssets} title='Lent Assets' />
      <LendingMarketsTable data={availableAssets} title='Available Markets' />
    </div>
  )
}
