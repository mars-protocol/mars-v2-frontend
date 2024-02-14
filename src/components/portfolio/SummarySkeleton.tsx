import React from 'react'

import HealthBar from 'components/account/Health/HealthBar'
import HealthIcon from 'components/account/Health/HealthIcon'
import Card from 'components/common/Card'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import HLSTag from 'components/hls/HLSTag'
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
          <div className='flex items-center justify-end flex-grow gap-2'>
            <HealthIcon isLoading={healthFactor === 0} health={health} />
            <div className='w-[260px]'>
              <HealthBar health={health} healthFactor={healthFactor} className='h-3' />
            </div>
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
