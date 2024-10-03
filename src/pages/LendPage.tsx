import Tab from 'components/earn/Tab'
import LendIntro from 'components/earn/lend/LendIntro'
import Lends from 'components/earn/lend/Lends'
import { getEarnTabs } from 'constants/pages'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function LendPage() {
  const chainConfig = useChainConfig()
  const tabs = getEarnTabs(chainConfig)

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={tabs} activeTabIdx={0} />
      <LendIntro />
      <Lends />
    </div>
  )
}
