'use client'
import DisplayCurrency from 'components/DisplayCurrency'
import { Heart, Shield } from 'components/Icons'
import { Text } from 'components/Text'
import useStore from 'store'

interface Props {
  balance: number
  risk: number
  health: number
}

export default function AccountStats(props: Props) {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const healthBarWidth = 53 * props.health

  return (
    <div className='w-full flex-wrap'>
      <DisplayCurrency
        coin={{ amount: props.balance.toString(), denom: 'uosmo' }}
        className='w-full text-xl'
      />
      <div className='mt-1 flex w-full items-center'>
        <Text size='xs' className='flex items-center'>
          <Shield className='mr-1.5 h-3' />
          <span className='text-white/70'>{`Risk score: ${props.risk}/100`}</span>
        </Text>
        <Text size='2xs' className='mx-2 -mt-1'>
          &bull;
        </Text>
        <Text size='xs' className='flex items-center'>
          <Heart className='mr-1.5 h-3' />
          <span className='mr-2 text-white/70'>Health</span>
          <svg
            width='53'
            height='4'
            viewBox='0 0 53 4'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect width='53' height='4' rx='2' fill='white' fillOpacity='0.1' />
            <rect
              width={healthBarWidth}
              height='4'
              rx='2'
              fill='url(#bar)'
              style={{
                transition: enableAnimations ? 'width 1s ease' : 'none',
              }}
            />
            <defs>
              <linearGradient
                id='bar'
                x1={healthBarWidth}
                y1='0'
                x2='0.208'
                y2='0'
                gradientUnits='userSpaceOnUse'
              >
                <stop stopColor='#FF645F' />
                <stop offset='0.489583' stopColor='#FFB1AE' />
                <stop offset='1' stopColor='#FFD5D3' />
              </linearGradient>
            </defs>
          </svg>
        </Text>
      </div>
    </div>
  )
}
