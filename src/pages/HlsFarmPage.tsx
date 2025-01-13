import Tab from 'components/earn/Tab'
import { ActiveHlsFarms } from 'components/hls/Farm/ActiveHlsFarms'
import { AvailableHlsFarms } from 'components/hls/Farm/AvailableHlsFarms'
import HlsFarmIntro from 'components/hls/Farm/HlsFarmIntro'
import { HLS_TABS } from 'constants/pages'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useIsOsmosis from 'hooks/chain/useIsOsmosis'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function HlsFarmPage() {
  const isOsmosis = useIsOsmosis()

  // If hls is disabled, redirect to trade page
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  useEffect(() => {
    if (!chainConfig.hls) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.hls, navigate, searchParams])

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
