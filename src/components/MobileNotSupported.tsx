import Spline from '@splinetool/react-spline'

import Button from 'components/Button'
import Text from 'components/Text'

export default function MobileNotSupported() {
  return (
    <section className='relative flex items-start justify-center'>
      <div className='w-[312px] flex flex-wrap justify-center'>
        <Spline
          style={{ height: '340px', width: '300px' }}
          scene='https://prod.spline.design/kk5kXiGlaUIbEL0M/scene.splinecode'
        />
        <Text size='4xl' className='w-[288px] pb-2 text-center'>
          Mars is not available on mobile
        </Text>
        <Text className='w-full text-center text-white/60'>
          Mars doesn&apos;t support mobile devices yet, please visit us later or use a desktop
        </Text>
        <div className='flex justify-center w-full'>
          <Button
            className='w-2/3 mt-4'
            text='Visit Mars v1'
            color='tertiary'
            size='lg'
            onClick={() => window.open('https://v1.marsprotocol.io', '_self')}
          />
        </div>
      </div>
    </section>
  )
}
