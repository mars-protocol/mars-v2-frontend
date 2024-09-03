import Tab from 'components/earn/Tab'
import { VAUTLS_TABS } from 'constants/pages'

export default function VaultsOfficialPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAUTLS_TABS} activeTabIdx={0} />
    </div>
  )
}
