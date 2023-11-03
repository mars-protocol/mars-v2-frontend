import React from 'react'

import HealthBar from 'components/Account/Health/HealthBar'
import Card from 'components/Card'
import HLSTag from 'components/HLS/HLSTag'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'

interface Props {
  stats: { title: React.ReactNode; sub: string }[]
  health: number
  healthFactor: number
  accountId: string
  isCurrent?: boolean
  isHls?: boolean
}

export default function Skeleton(props: Props) {
  const { stats, health, healthFactor, accountId, isCurrent } = props
  return (
    <Card className='p-4 bg-white/5'>
      <div className='flex items-center justify-between'>
        <Text>
          Credit Account {accountId}
          {props.isHls && <HLSTag />}
        </Text>
        <Text size='xs' className='text-white/60'>
          {isCurrent && '(current)'}
        </Text>
      </div>
      <div className='flex gap-4 mt-6'>
        {stats.map(({ title, sub }) => (
          <TitleAndSubCell key={`${accountId}-${sub}`} title={title} sub={sub} />
        ))}
      </div>
      <div className='flex gap-1 mt-6'>
        <HealthBar health={health} healthFactor={healthFactor} showIcon />
      </div>
    </Card>
  )
}
