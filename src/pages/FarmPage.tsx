import { AvailableVaults, DepositedVaults } from 'components/Earn/Farm/Vaults'
import Tab from 'components/Earn/Tab'

export default function FarmPage() {
  return (
    <div className='flex w-full flex-wrap gap-4'>
      <Tab isFarm />
      {/* <FeaturedVaults /> */}
      <DepositedVaults />
      <AvailableVaults />
    </div>
  )
}
