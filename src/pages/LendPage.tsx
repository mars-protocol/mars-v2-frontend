import MigrationBanner from 'components/common/MigrationBanner'
import Tab from 'components/earn/Tab'
import LendIntro from 'components/earn/lend/LendIntro'
import Lends from 'components/earn/lend/Lends'
import { EARN_TABS } from 'constants/pages'
import useChainConfig from 'hooks/useChainConfig'

export default function LendPage() {
  const chainConfig = useChainConfig()

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      {chainConfig.farm && <Tab tabs={EARN_TABS} activeTabIdx={0} />}
      <LendIntro />
      <Lends />
    </div>
  )
}
