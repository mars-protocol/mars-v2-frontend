import { PythLogoType } from 'components/common/Icons'
import Text from 'components/common/Text'

export default function PoweredByPyth() {
  return (
    <div className='flex items-center justify-end w-full gap-2 p-2'>
      <Text className='text-2xs-caps text-white/60'>powered by</Text>
      <PythLogoType className='h-6' />
    </div>
  )
}
