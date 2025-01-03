import { ReactNode } from 'react'

import HealthBar from 'components/account/Health/HealthBar'
import HealthIcon from 'components/account/Health/HealthIcon'
import Card from 'components/common/Card'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import HlsTag from 'components/hls/HlsTag'
import useAccount from 'hooks/accounts/useAccount'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'

interface Props {
  stats?: { title: React.ReactNode | null; sub: string }[]
  health?: number
  healthFactor?: number
  title: string | ReactNode
  accountId: string
}

export default function SummarySkeleton(props: Props) {
  const { health, healthFactor, title } = props
  const stats = props.stats || DEFAULT_PORTFOLIO_STATS
  const { data: account } = useAccount(props.accountId, false)

  return (
    <div className='flex flex-col w-full gap-4 md:gap-8'>
      <div className='flex flex-wrap justify-between gap-2 md:flex-nowrap'>
        <div className='flex items-center'>
          <Text size='2xl'>{title}</Text>
          {account?.kind === 'high_levered_strategy' && <HlsTag />}
        </div>
        {health !== undefined && healthFactor !== undefined && (
          <div className='flex items-center gap-2 md:flex-grow md:justify-end'>
            <HealthIcon isLoading={healthFactor === 0} health={health} />
            <div className='w-[260px]'>
              <HealthBar health={health} healthFactor={healthFactor} className='h-3' />
            </div>
          </div>
        )}
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
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
