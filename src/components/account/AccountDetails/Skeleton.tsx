import classNames from 'classnames'

import { HealthGauge } from 'components/account/Health/HealthGauge'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'

interface Props {
  className?: string
}

export default function Skeleton(props: Props) {
  return (
    <div
      className={classNames(
        'bg-surface hidden items-start gap-4 absolute right-1 top-0.5 z-2',
        'md:flex',
        props.className,
      )}
    >
      <div className='group/accountdetail relative min-h-75 bg-surface z-3 overflow-hidden w-16 hover:bg-surface hover:cursor-pointer'>
        <div className='flex flex-wrap justify-center w-full py-4'>
          <HealthGauge health={0} healthFactor={0} />
          <Text size='2xs' className='mb-0.5 mt-1 w-full text-center text-white/50'>
            Health
          </Text>
        </div>
        <div className='flex flex-wrap justify-center w-full py-4'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50 whitespace-nowrap'>
            Net worth
          </Text>
          <Loading className='w-10 h-3 mt-1' />
        </div>
        <div className='flex flex-wrap justify-center w-full py-4'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
            Leverage
          </Text>
          <Loading className='w-10 h-3 mt-1' />
        </div>
        <div className='flex flex-wrap justify-center w-full py-4'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
            APY
          </Text>
          <Loading className='w-10 h-3 mt-1' />
        </div>
      </div>
    </div>
  )
}
