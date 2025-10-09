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
    <div className='p-3 space-y-4 text-white/60'>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <div className='flex justify-between items-center'>
            <Text size='xs'>{stat.description}</Text>
            <div className='text-white text-xs'>{stat.value}</div>
          </div>
          {index < stats.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </div>
  )
}
