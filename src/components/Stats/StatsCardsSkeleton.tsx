import React from 'react'

import Card from 'components/Card'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { DEFAULT_ADDITIONAL_STATS } from 'utils/constants'

interface Props {
  stats?: Stat[]
}

interface Stat {
  head: string
  title: React.ReactNode | null
  sub: string
}

export default function StatsCardsSkeleton(props: Props) {
  const stats = props.stats || DEFAULT_ADDITIONAL_STATS

  return (
    <div className='grid w-full grid-cols-3 gap-4'>
      {stats.map((stat) => (
        <Card key={stat.sub} className='p-6 bg-white/5 flex-grow-1'>
          <Text size='sm' className='mb-2 text-white/60'>
            {stat.head}
          </Text>
          <TitleAndSubCell
            title={stat.title || <Loading className='w-20 h-6 mx-auto mb-2' />}
            sub={stat.sub}
            className='mb-1'
          />
        </Card>
      ))}
    </div>
  )
}
