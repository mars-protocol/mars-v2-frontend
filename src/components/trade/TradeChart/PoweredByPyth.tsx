import { PythLogoType } from 'components/common/Icons'
import Text from 'components/common/Text'

export default function PoweredByPyth() {
  return (
    <div className='flex items-center justify-end w-full gap-2 p-2 bg-surface-dark'>
      <Text className='text-2xs-caps text-white/60'>powered by</Text>
      <div className='w-[71px]'>
        <PythLogoType />
      </div>
    </div>
  )
}
