import Tab from 'components/earn/Tab'
import FarmIntro from 'components/earn/farm/FarmIntro'
import Vaults from 'components/earn/farm/Vaults'
import { EARN_TABS } from 'constants/pages'

export default function FarmPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={EARN_TABS} activeTabIdx={1} />
      <FarmIntro />
      <Vaults />
    </div>
  )
}
