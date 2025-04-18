import { CircularProgress } from 'components/common/CircularProgress'
import { ArrowRight, Bridge } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import Image from 'next/image'

interface BridgeRouteVisualizerProps {
  bridges: BridgeInfo[]
  originChain: string
  isLoading: boolean
  className?: string
  evmChainLogo: string | null
}

export default function BridgeRouteVisualizer({
  bridges,
  originChain,
  className = '',
  isLoading,
  evmChainLogo,
}: BridgeRouteVisualizerProps) {
  if (!bridges?.length) return null

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isLoading && <CircularProgress />}
      {evmChainLogo && (
        <Tooltip type='info' content={<Text size='xs'>{capitalizeFirstLetter(originChain)}</Text>}>
          <div>
            <Image src={evmChainLogo} width={24} height={24} alt='EVM Chain' />
          </div>
        </Tooltip>
      )}
      {bridges.map((bridge, index) => {
        const bridgeLogo = bridge.logo_uri
        return (
          <div key={index} className='flex items-center gap-2'>
            <ArrowRight className='w-4 h-4 text-white/60' />
            <Tooltip
              type='info'
              content={<Text size='xs'>{capitalizeFirstLetter(bridge.name)}</Text>}
            >
              <div>
                {bridgeLogo ? (
                  <Image src={bridgeLogo} alt='bridge' width={24} height={24} />
                ) : (
                  <div className='w-6 h-6 text-center text-white/60'>
                    <Bridge />
                  </div>
                )}
              </div>
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}
