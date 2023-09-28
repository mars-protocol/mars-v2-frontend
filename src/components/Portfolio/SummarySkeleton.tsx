import React from 'react'

import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'

import HealthBar from '../Account/HealthBar'
import Card from '../Card'
import { Heart } from '../Icons'
import Loading from '../Loading'
import Text from '../Text'
import TitleAndSubCell from '../TitleAndSubCell'

interface Props {
  stats?: { title: React.ReactNode | null; sub: string }[]
  health?: number
  title: string
}

export default function SummarySkeleton(props: Props) {
  const stats = props.stats || DEFAULT_PORTFOLIO_STATS
  return (
    <div className='flex flex-col w-full gap-8'>
      <div className='flex justify-between'>
        <Text size='2xl'>{props.title}</Text>
        {props.health !== undefined && (
          <div className='flex gap-1 max-w-[300px] flex-grow'>
            <Heart width={20} />
            <HealthBar health={props.health} className='h-full' />
          </div>
        )}
      </div>
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3'>
        {stats.map((stat) => (
          <Card key={stat.sub} className='p-6 text-center bg-white/5 flex-grow-1'>
            <TitleAndSubCell
              title={stat.title || <Loading className='w-20 h-6 mx-auto mb-2' />}
              sub={stat.sub}
              className='mb-1'
            />
          </Card>
        ))}
      </div>
    </div>
  )
}
