import React from 'react'

import HealthBar from 'components/account/Health/HealthBar'
import Card from 'components/common/Card'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import HlsTag from 'components/hls/HlsTag'
import USDCMarginTag from 'components/perps/USDCMarginTag'

interface Props {
  stats: { title: React.ReactNode; sub: string }[]
  health: number
  healthFactor: number
  accountId: string
  isCurrent?: boolean
  isHls?: boolean
  isUSDC?: boolean
}

export default function Skeleton(props: Props) {
  const { stats, health, healthFactor, accountId, isCurrent, isHls, isUSDC } = props
  return (
    <Card className='p-4 bg-white/5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Text>
            Credit Account {accountId}
            {isHls && <HlsTag />}
          </Text>
          {isUSDC && <USDCMarginTag />}
        </div>
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
