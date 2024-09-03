import Tab from 'components/earn/Tab'
import { VAUTLS_TABS } from 'constants/pages'

export default function VaultsCommunityPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAUTLS_TABS} activeTabIdx={1} />
    </div>
  )
}
