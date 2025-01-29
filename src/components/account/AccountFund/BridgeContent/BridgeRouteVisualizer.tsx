import { RouteResponse } from '@skip-go/client'
import { ArrowRight, Bridge } from 'components/common/Icons'
import { BridgeInfo } from 'hooks/bridge/useSkipBridge'
import Image from 'next/image'
import { getChainLogoByName } from 'utils/chainLogos'

interface BridgeRouteVisualizerProps {
  route?: RouteResponse
  bridges: BridgeInfo[]
  originChain: string
  className?: string
}

// Define a type to handle the runtime object structure
interface OperationRuntime {
  cctpTransfer?: {
    bridgeID: string
  }
  transfer?: {
    bridgeID: string
  }
}

export default function BridgeRouteVisualizer({
  route,
  bridges,
  originChain,
  className = '',
}: BridgeRouteVisualizerProps) {
  if (!route?.operations?.length) return null

  const getBridgeLogo = (operation: OperationRuntime) => {
    const bridgeId = operation.cctpTransfer?.bridgeID || operation.transfer?.bridgeID
    return bridges.find((bridge) => bridge.id === bridgeId)?.logo_uri
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src={getChainLogoByName(originChain)}
        alt={originChain}
        className='rounded-full'
        width={24}
        height={24}
      />
      {route.operations.map((operation, index) => {
        const op = operation as unknown as OperationRuntime
        const bridgeLogo = getBridgeLogo(op)
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
