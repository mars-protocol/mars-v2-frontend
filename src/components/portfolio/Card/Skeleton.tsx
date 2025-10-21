import React from 'react'

import HealthBar from 'components/account/Health/HealthBar'
import Card from 'components/common/Card'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { Tooltip } from 'components/common/Tooltip'
import HlsTag from 'components/hls/HlsTag'

interface Props {
  stats: { title: React.ReactNode; sub: string }[]
  health: number
  healthFactor: number
  accountId: string
  isCurrent?: boolean
  isHls?: boolean
  vaultTitle?: string
}

export default function Skeleton(props: Props) {
  const { stats, health, healthFactor, accountId, isCurrent, vaultTitle } = props

  return (
    <Card className='p-4 bg-surface'>
      <div className='flex items-center justify-between'>
        <Tooltip type='info' content={vaultTitle}>
          <Text className='truncate max-w-[250px]'>
            {vaultTitle}
            {props.isHls && <HlsTag />}
          </Text>
        </Tooltip>
        <Text size='xs' className='text-white/60'>
          {isCurrent && '(current)'}
        </Text>
      </div>
      <div className='flex gap-4 mt-6'>
        {stats.map(({ title, sub }) => (
          <TitleAndSubCell key={`${accountId}-${sub}`} title={title} sub={sub} />
        ))}
      </div>
      <div className='flex mt-6'>
        <HealthBar health={health} healthFactor={healthFactor} showIcon />
      </div>
    </Card>
  )
}
