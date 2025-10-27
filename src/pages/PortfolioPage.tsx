import ShareBar from 'components/common/ShareBar'
import AccountOverview from 'components/portfolio/Overview'
import PortfolioSummary from 'components/portfolio/Overview/Summary'
import PortfolioIntro from 'components/portfolio/PortfolioIntro'
import MarsStaking from 'components/staking/MarsStaking'

export default function PortfolioPage() {
  return (
    <div className='flex flex-wrap w-full gap-2 py-8'>
      <PortfolioIntro />

      <div className='grid grid-cols-1 gap-1 w-full'>
        <div className='w-full'>
          <PortfolioSummary />
        </div>
        <div className='w-full'>
          <MarsStaking className='h-full' />
        </div>
      </div>

      <div className='w-full'>
        <AccountOverview />
      </div>

      <div className='w-full'>
        <ShareBar text='Have a look at this @mars_protocol portfolio!' />
      </div>
    </div>
  )
}
