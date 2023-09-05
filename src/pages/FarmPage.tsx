import FarmIntro from 'components/Earn/Farm/FarmIntro'
import { AvailableVaults, DepositedVaults } from 'components/Earn/Farm/Vaults'
import Tab from 'components/Earn/Tab'

export default function FarmPage() {
  return (
    <div className='flex flex-wrap w-full gap-4'>
      <Tab isFarm />
      <FarmIntro />
      <DepositedVaults />
      <AvailableVaults />
    </div>
  )
}
