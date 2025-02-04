import { CircularProgress } from 'components/common/CircularProgress'
import { ArrowRight, Bridge } from 'components/common/Icons'
import { BridgeInfo } from 'hooks/bridge/useSkipBridge'
import Image from 'next/image'
import { getChainLogoByName } from 'utils/chainLogos'

interface BridgeRouteVisualizerProps {
  bridges: BridgeInfo[]
  originChain: string
  isLoading: boolean
  className?: string
}

export default function BridgeRouteVisualizer({
  bridges,
  originChain,
  className = '',
  isLoading,
}: BridgeRouteVisualizerProps) {
  if (!bridges?.length) return null

  const getBridgeLogo = (chainId: string) => {
    return bridges.find((bridge) => bridge.id === chainId)?.logo_uri
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isLoading && <CircularProgress />}
      <Image
        src={getChainLogoByName(originChain)}
        alt={originChain}
        className='rounded-full'
        width={24}
        height={24}
      />
      {bridges.map((bridge, index) => {
        const bridgeLogo = bridge.logo_uri
        return (
          <div key={index} className='flex items-center gap-2'>
            <ArrowRight className='w-4 h-4 text-white/60' />
            {bridgeLogo ? (
              <Image src={bridgeLogo} alt='bridge' width={24} height={24} />
            ) : (
              <div className='w-6 h-6 text-center text-white/60'>
                <Bridge />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
