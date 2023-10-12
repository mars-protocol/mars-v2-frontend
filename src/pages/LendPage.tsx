import LendingMarketsTable from 'components/Earn/Lend/LendingMarketsTable'
import LendIntro from 'components/Earn/Lend/LendIntro'
import Tab from 'components/Earn/Tab'
import MigrationBanner from 'components/MigrationBanner'
import { EARN_TABS } from 'constants/pages'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

export default function LendPage() {
  const { accountLentAssets, availableAssets } = useLendingMarketAssetsTableData()
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <Tab tabs={EARN_TABS} activeTabIdx={0} />
      <LendIntro />
      <LendingMarketsTable data={accountLentAssets} title='Lent Assets' />
      <LendingMarketsTable data={availableAssets} title='Available Markets' />
    </div>
  )
}
