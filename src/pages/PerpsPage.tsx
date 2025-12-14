import GridWithSplitters from 'components/common/Grid/GridWithSplitters'
import { ExclamationMarkTriangle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { PerpsModule } from 'components/perps/Module/PerpsModule'
import PerpsBanner from 'components/perps/PerpsBanner'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import { PerpsTabs } from 'components/perps/PerpsTabs'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function PerpsPage() {
  // If perps is disabled, redirect to trade page
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  useEffect(() => {
    if (!chainConfig.perps) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.perps, navigate, searchParams])
  return (
    <div className='flex flex-col w-full md:h-full'>
      {/* Announcement banner - fixed below navbar */}
      <div className='fixed top-18 left-0 right-0 z-50 bg-white/10 border-b border-white/20 backdrop-blur-sm'>
        <div className='flex items-center justify-center gap-2 px-4 py-2.5'>
          <ExclamationMarkTriangle className='w-4 h-4 text-white' />
          <Text size='sm' className='text-white'>
            Perps markets have been temporarily disabled. You are still able to close your existing
            positions.
          </Text>
        </div>
      </div>
      {/* Spacer to account for fixed banner */}
      <div className='h-10' />
      <GridWithSplitters
        className='flex-1'
        chartArea={
          <div className='w-full md:h-full flex flex-col'>
            <PerpsBanner />
            <div className='flex-1 bg-surface md:h-full'>
              <div className='w-full md:h-full'>
                <PerpsTabs />
              </div>
            </div>
          </div>
        }
        rightArea={<PerpsModule />}
        bottomArea={<PerpsPositions />}
      />
    </div>
  )
}
