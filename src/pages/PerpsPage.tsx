import GridWithSplitters from 'components/common/Grid/GridWithSplitters'
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
    <div className='flex flex-col w-full h-full'>
      <GridWithSplitters
        className='flex-1'
        chartArea={
          <div className='w-full h-full flex flex-col'>
            <PerpsBanner />
            <div className='flex-1 bg-surface h-full'>
              <div className='w-full h-full'>
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
