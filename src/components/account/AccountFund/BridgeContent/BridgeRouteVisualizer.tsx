import { RouteResponse } from '@skip-go/client'
import { BridgeInfo } from 'hooks/bridge/useSkipBridge'
import { getChainLogoByName } from 'utils/chainLogos'
import { ArrowRight } from 'components/common/Icons'

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

  console.log('getBridgeLogo', getBridgeLogo)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={getChainLogoByName(originChain)}
        alt={originChain}
        className='w-6 h-6 rounded-full'
      />
      {route.operations.map((operation, index) => {
        const op = operation as unknown as OperationRuntime
        const bridgeLogo = getBridgeLogo(op)
        console.log('bridgeLogo', bridgeLogo)

        return (
          <div key={index} className='flex items-center gap-2'>
            <ArrowRight className='w-4 h-4 text-white/60' />
            {bridgeLogo && <img src={bridgeLogo} alt='bridge' className='w-6 h-6' />}
          </div>
        )
      })}
    </div>
  )
}
