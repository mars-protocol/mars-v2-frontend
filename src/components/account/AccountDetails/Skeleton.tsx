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
        'absolute flex items-start w-16 gap-4 right-4 top-6 opacity-90',
        props.className,
      )}
    >
      <div className='relative flex flex-wrap w-16 border min-w-16 rounded-base border-white/20'>
        <div className='flex flex-wrap justify-center w-full py-4'>
          <HealthGauge health={0} healthFactor={0} />
          <Text size='2xs' className='mb-0.5 mt-1 w-full text-center text-white/50'>
            Health
          </Text>
        </div>
        <div className='flex flex-wrap justify-center w-full py-4 border-t border-white/20'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50 whitespace-nowrap'>
            Net worth
          </Text>
          <Loading className='w-10 h-3 mt-1' />
        </div>
        <div className='flex flex-wrap justify-center w-full py-4 border-t border-white/20'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
            Leverage
          </Text>
          <Loading className='w-10 h-3 mt-1' />
        </div>
        <div className='flex flex-wrap justify-center w-full py-4 border-t border-white/20'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
            APY
          </Text>
          <Loading className='w-10 h-3 mt-1' />
        </div>
      </div>
    </div>
  )
}
