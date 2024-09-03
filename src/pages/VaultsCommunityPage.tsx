import Tab from 'components/earn/Tab'
import VaultsCommunityIntro from 'components/vaults/community/VaultsCommunityIntro'
import { AvailableVaults } from 'components/vaults/common/AvailableVaults'
import { VAUTLS_TABS } from 'constants/pages'
import { vaultsCommunityDummyData } from 'components/vaults/dummyData'

export default function VaultsCommunityPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAUTLS_TABS} activeTabIdx={1} />
      <VaultsCommunityIntro />
      <AvailableVaults data={vaultsCommunityDummyData} />
    </div>
  )
}
