import LendIntro from 'components/Earn/Lend/LendIntro'
import LendingMarketsTable from 'components/Earn/Lend/LendingMarketsTable'
import Tab from 'components/Earn/Tab'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function LendPage() {
  const { accountLentAssets, availableAssets } = useLendingMarketAssetsTableData()
  return (
    <div className='flex flex-wrap w-full gap-4'>
      <Tab />
      <LendIntro />
      <LendingMarketsTable data={accountLentAssets} title='Lent Assets' />
      <LendingMarketsTable data={availableAssets} title='Available Markets' />
    </div>
  )
}
