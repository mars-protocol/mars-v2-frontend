import Tab from 'components/Earn/Tab'
import { AvailableVaults, DepositedVaults } from 'components/Earn/Vault/Vaults'

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
