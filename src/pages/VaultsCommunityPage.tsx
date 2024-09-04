import Tab from 'components/earn/Tab'
import VaultsCommunityIntro from 'components/vaults/community/VaultsCommunityIntro'
import { VAUTLS_TABS } from 'constants/pages'
import { AvailableCommunityVaults } from 'components/vaults/community/table/AvailableCommunityVaults'

export default function VaultsCommunityPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAUTLS_TABS} activeTabIdx={1} />
      <VaultsCommunityIntro />
      <AvailableCommunityVaults />
    </div>
  )
}
