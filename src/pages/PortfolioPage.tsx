import ShareBar from 'components/common/ShareBar'
import AccountOverview from 'components/portfolio/Overview'
import PortfolioSummary from 'components/portfolio/Overview/Summary'
import PortfolioIntro from 'components/portfolio/PortfolioIntro'
import MarsStaking from 'components/staking/MarsStaking'

export default function PortfolioPage() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 w-full h-full'>
      <div className='lg:col-span-12'>
        <PortfolioIntro />
      </div>
      <div className='lg:col-span-6'>
        <PortfolioSummary />
      </div>
      <div className='lg:col-span-6'>
        <MarsStaking className='w-full h-full' />
      </div>
      <div className='lg:col-span-12'>
        <AccountOverview />
      </div>
      <div className='lg:col-span-12'>
        <ShareBar text='Have a look at this @mars_protocol portfolio!' />
      </div>
    </div>
  )
}
