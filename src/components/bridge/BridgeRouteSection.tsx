import { RouteResponse } from '@skip-go/client'
import classNames from 'classnames'
import Text from 'components/common/Text'
import { BridgeInfo } from 'hooks/bridge/useSkipBridge'
import BridgeRouteVisualizer from 'components/account/AccountFund/BridgeContent/BridgeRouteVisualizer'
import { getChainLogoByName } from 'utils/chainLogos'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'

interface BridgeRouteSectionProps {
  currentRoute: RouteResponse | undefined
  goFast: boolean
  setGoFast: (value: boolean) => void
  isLoadingRoute: boolean
  bridges: BridgeInfo[]
  fundingAssets: WrappedBNCoin[]
}

export default function BridgeRouteSection({
  currentRoute,
  goFast,
  setGoFast,
  isLoadingRoute,
  bridges,
  fundingAssets,
}: BridgeRouteSectionProps) {
  if (!currentRoute) return null

  return (
    <div className='flex flex-col pt-4 mt-4 border-t border-white/10'>
      <div className='flex flex-row justify-between items-center gap-2'>
        <Text className='mr-2 text-white/70' size='sm'>
          Route Preference
        </Text>
        <div className='flex gap-2'>
          <button
            onClick={() => setGoFast(true)}
            className={classNames(
              'flex-1 px-4 py-2 rounded text-sm transition-colors duration-200',
              goFast
                ? 'bg-white/10 text-white'
                : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            Fastest
          </button>
          <button
            onClick={() => setGoFast(false)}
            className={classNames(
              'flex-1 px-4 py-2 rounded text-sm transition-colors duration-200',
              !goFast
                ? 'bg-white/10 text-white'
                : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            Cheapest
          </button>
        </div>
      </div>

      <div className='mt-4 flex flex-row justify-between gap-2'>
        <Text className='mr-2 text-white/70' size='sm'>
          Route
        </Text>
        <BridgeRouteVisualizer
          isLoading={isLoadingRoute}
          bridges={bridges}
          originChain={fundingAssets.find((asset) => asset.chain)?.chain || ''}
          evmChainLogo={getChainLogoByName(fundingAssets.find((asset) => asset.chain)?.chain || '')}
        />
      </div>
    </div>
  )
}
