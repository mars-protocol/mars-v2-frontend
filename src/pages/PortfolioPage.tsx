import ShareBar from 'components/common/ShareBar'
import AccountOverview from 'components/portfolio/Overview'
import PortfolioSummary from 'components/portfolio/Overview/Summary'
import PortfolioIntro from 'components/portfolio/PortfolioIntro'
import MarsStaking from 'components/staking/MarsStaking'

export default function PortfolioPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <PortfolioIntro />
      <PortfolioSummary />
      <MarsStaking className='w-full bg-white/5' />
      <AccountOverview />
      <ShareBar text='Have a look at this @mars_protocol portfolio!' />
    </div>
  )
}
