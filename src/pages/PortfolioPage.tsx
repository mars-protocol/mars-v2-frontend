import AccountOverview from 'components/Portfolio/Overview'
import PortfolioIntro from 'components/Portfolio/PortfolioIntro'

export default function PortfolioPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <PortfolioIntro />
      <AccountOverview />
    </div>
  )
}
