import Tab from 'components/earn/Tab'
import LendIntro from 'components/earn/lend/LendIntro'
import Lends from 'components/earn/lend/Lends'
import { EARN_TABS } from 'constants/pages'

export default function LendPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={EARN_TABS} activeTabIdx={0} />
      <LendIntro />
      <Lends />
    </div>
  )
}
