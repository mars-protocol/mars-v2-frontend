import { useLocation } from 'react-router-dom'

import Tab from 'components/Earn/Tab'
import MigrationBanner from 'components/MigrationBanner'
import StatsAccounts from 'components/Stats/StatsAdditional'
import StatsFarm from 'components/Stats/StatsFarm'
import StatsLendAndBorrow from 'components/Stats/StatsLendAndBorrow'
import StatsTrading from 'components/Stats/StatsTrading'
import { STATS_TABS } from 'constants/pages'
import { getPage } from 'utils/route'

function getStatsComponent(page: Page) {
  switch (page) {
    case 'stats-farm':
      return <StatsFarm />
    case 'stats-lend-borrow':
      return <StatsLendAndBorrow />
    case 'stats-additional':
      return <StatsAccounts />
    default:
      return <StatsTrading />
  }
}

export default function StatsPage() {
  const { pathname } = useLocation()
  const page = getPage(pathname)
  const activeIndex = STATS_TABS.findIndex((tab) => tab.page === page)

  return (
    <div className='flex flex-wrap w-full'>
      <MigrationBanner />
      <Tab tabs={STATS_TABS} activeTabIdx={activeIndex === -1 ? 0 : activeIndex} className='mb-8' />
      {getStatsComponent(page)}
    </div>
  )
}
