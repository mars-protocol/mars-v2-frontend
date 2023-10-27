import { useMemo } from 'react'

import { CircularProgress } from 'components/CircularProgress'
import Text from 'components/Text'
import { BN } from 'utils/helpers'

interface Props {
  health: number
  healthFactor: number
}

export default function HealthTooltip(props: Props) {
  const { health, healthFactor } = props

  const healthStatus = useMemo(() => {
    if (health > 30) return 'Healthy'
    if (health > 10) return 'Attention'
    if (health > 0 && health <= 10) return 'Close to Liquidation'

    return 'Liquidation Risk'
  }, [health])

  if (healthFactor === 0)
    return (
      <div className='flex flex-wrap justify-center'>
        <Text size='xs' className='w-full mb-1 text-center'>
          Loading...
        </Text>
        <CircularProgress size={14} />
      </div>
    )

  return (
    <div className='flex flex-wrap justify-center w-20'>
      <Text size='xs' className='text-center'>
        Health: {health}%
      </Text>
      <Text size='2xs' className='mb-1 text-center'>
        ({healthStatus})
      </Text>
      <Text size='2xs' className='text-center text-white/70'>
        Health Factor: {BN(healthFactor).toPrecision(4)}
      </Text>
      {health > 0 && health <= 10 && (
        <Text size='2xs' className='text-center text-info'>
          A small price movement can cause your account to be become liquidatable!
        </Text>
      )}
      {health === 0 && (
        <Text size='2xs' className='text-center text-martian-red'>
          Your account is unhealthy and can be liquidated!
        </Text>
      )}
    </div>
  )
}
