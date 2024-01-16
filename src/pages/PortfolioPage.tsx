import MigrationBanner from 'components/common/MigrationBanner'
import AccountOverview from 'components/portfolio/Overview'
import PortfolioSummary from 'components/portfolio/Overview/Summary'
import PortfolioIntro from 'components/portfolio/PortfolioIntro'
import ShareBar from 'components/common/ShareBar'

export default function PortfolioPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <PortfolioIntro />
      <PortfolioSummary />
      <AccountOverview />
      <ShareBar text='Have a look at this @mars_protocol portfolio!' />
    </div>
  )
}
