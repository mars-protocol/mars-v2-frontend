import MigrationBanner from 'components/MigrationBanner'
import AccountOverview from 'components/Portfolio/Overview'
import PortfolioSummary from 'components/Portfolio/Overview/Summary'
import PortfolioIntro from 'components/Portfolio/PortfolioIntro'
import ShareBar from 'components/ShareBar'

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
