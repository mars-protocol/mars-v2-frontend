import MigrationBanner from 'components/MigrationBanner'
import AccountOverview from 'components/Portfolio/Overview'
import PortfolioSummary from 'components/Portfolio/Overview/Summary'
import PortfolioIntro from 'components/Portfolio/PortfolioIntro'

export default function PortfolioPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <PortfolioIntro />
      <PortfolioSummary />
      <AccountOverview />
    </div>
  )
}
