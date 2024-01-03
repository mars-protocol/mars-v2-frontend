import React from 'react'

import HealthBar from 'components/Account/Health/HealthBar'
import HealthIcon from 'components/Account/Health/HealthIcon'
import Card from 'components/Card'
import HLSTag from 'components/HLS/HLSTag'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useAccount from 'hooks/accounts/useAccount'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'

interface Props {
  stats?: { title: React.ReactNode | null; sub: string }[]
  health?: number
  healthFactor?: number
  title: string
  accountId: string
}

export default function SummarySkeleton(props: Props) {
  const { health, healthFactor, title } = props
  const stats = props.stats || DEFAULT_PORTFOLIO_STATS
  const { data: account } = useAccount(props.accountId, false)

  return (
    <div className='flex flex-col w-full gap-8'>
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <Text size='2xl'>{title}</Text>
          {account?.kind === 'high_levered_strategy' && <HLSTag />}
        </div>
        {health !== undefined && healthFactor !== undefined && (
          <div className='flex gap-1 max-w-[300px] flex-grow'>
            <HealthIcon isLoading={healthFactor === 0} health={health} className='w-5' />
            <HealthBar health={health} healthFactor={healthFactor} className='h-full' />
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
