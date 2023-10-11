import React from 'react'

import HealthBar from 'components/Account/HealthBar'
import Card from 'components/Card'
import { Heart } from 'components/Icons'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'

interface Props {
  stats: { title: React.ReactNode; sub: string }[]
  health: number
  accountId: string
  isCurrent?: boolean
}

export default function Skeleton(props: Props) {
  return (
    <Card className='p-4 bg-white/5'>
      <div className='flex items-center justify-between'>
        <Text>Credit Account {props.accountId}</Text>
        <Text size='xs' className='text-white/60'>
          {props.isCurrent && '(current)'}
        </Text>
      </div>
      <div className='flex gap-4 mt-6'>
        {props.stats.map(({ title, sub }) => (
          <TitleAndSubCell key={`${props.accountId}-${sub}`} title={title} sub={sub} />
        ))}
      </div>
      <div className='flex gap-1 mt-6'>
        <Heart width={20} />
        <HealthBar health={props.health} />
      </div>
    </Card>
  )
}
