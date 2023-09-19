import React from 'react'

import HealthBar from 'components/Account/HealthBar'
import Card from 'components/Card'
import { Heart } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'

interface Props {
  stats: { title: React.ReactNode; sub: string }[]
  health: number
  isCurrent?: boolean
  accountId?: string
}

export default function Skeleton(props: Props) {
  return (
    <Card className='bg-white/5 p-4'>
      <div className='flex justify-between items-center'>
        <Text>Credit account {props.accountId || <Loading />}</Text>
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
