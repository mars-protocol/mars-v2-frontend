import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import React, { ReactNode } from 'react'

interface StatRow {
  description: string
  value: string | ReactNode
}

interface Props {
  stats: StatRow[]
}

export default function VaultStats(props: Props) {
  const { stats } = props
  return (
    <div className='bg-white/5 p-3 space-y-3 text-white/60'>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <div className='flex justify-between items-center'>
            <Text size='xs'>{stat.description}</Text>
            <Text size='xs' className='text-white'>
              {stat.value}
            </Text>
          </div>
          {index < stats.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </div>
  )
}
