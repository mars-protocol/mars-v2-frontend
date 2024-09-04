import Tab from 'components/earn/Tab'
import VaultsOfficialIntro from 'components/vaults/official/VaultsOfficialIntro'
import { VAUTLS_TABS } from 'constants/pages'
import { AvailableOfficialVaults } from 'components/vaults/official/table/AvailableOfficialVaults'

export default function VaultsOfficialPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAUTLS_TABS} activeTabIdx={0} />
      <VaultsOfficialIntro />
      <AvailableOfficialVaults />
    </div>
  )
}
