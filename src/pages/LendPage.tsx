import Tab from 'components/Earn/Tab'
import LendingMarketsTable from 'components/Earn/Lend/LendingMarketsTable'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function LendPage() {
  const { lentAssets, availableAssets } = useLendingMarketAssetsTableData()

  return (
    <>
      <Tab />
      <LendingMarketsTable data={lentAssets} title='Lent Assets' />
      <LendingMarketsTable data={availableAssets} title='Available Markets' />
    </>
  )
}
