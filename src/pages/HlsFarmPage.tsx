import Tab from 'components/earn/Tab'
import { ActiveHlsFarms } from 'components/hls/Farm/ActiveHlsFarms'
import { AvailableHlsFarms } from 'components/hls/Farm/AvailableHlsFarms'
import HlsFarmIntro from 'components/hls/Farm/HlsFarmIntro'
import { HLS_TABS } from 'constants/pages'
import useIsOsmosis from 'hooks/chain/useIsOsmosis'

export default function HlsFarmPage() {
  const isOsmosis = useIsOsmosis()
  if (isOsmosis) return
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={HLS_TABS} activeTabIdx={1} />
      <HlsFarmIntro />
      <AvailableHlsFarms />
      <ActiveHlsFarms />
    </div>
  )
}
