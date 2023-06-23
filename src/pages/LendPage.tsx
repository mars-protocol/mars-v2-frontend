import Tab from 'components/Earn/Tab'
import LendingMarketsTable from 'components/Earn/Lend/LendingMarketsTable'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function LendPage() {
  const { accountLentAssets, availableAssets } = useLendingMarketAssetsTableData()

  return (
    <>
      <Tab />
      <LendingMarketsTable data={accountLentAssets} title='Lent Assets' />
      <LendingMarketsTable data={availableAssets} title='Available Markets' />
    </>
  )
}
