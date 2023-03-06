'use client'
import { Gauge } from 'components/Gauge'
import { Heart } from 'components/Icons'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'

export default function AccountDetails() {
  const params = useParams()
  const hasAccount = params.account && !isNaN(Number(params.account))

  return hasAccount ? (
    <div className='fixed top-[89px] right-4 w-16 rounded-base border border-white/20 bg-white/5 backdrop-blur-sticky'>
      <div className='flex w-full flex-wrap justify-center py-4'>
        <Gauge tooltip='Health Factor' value={0.2} icon={<Heart />} />
        <Text size='2xs' className='mt-1 mb-0.5 w-full text-center text-white/50'>
          Health
        </Text>
        <Text size='xs' className='w-full text-center'>
          89%
        </Text>
      </div>
      <div className='w-full border border-x-0 border-white/20 py-4'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Leverage
        </Text>
        <Text size='xs' className='w-full text-center'>
          4.5x
        </Text>
      </div>
      <div className='w-full py-4'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Balance
        </Text>{' '}
        <Text size='xs' className='w-full text-center'>
          $300M
        </Text>
      </div>
    </div>
  ) : null
}
