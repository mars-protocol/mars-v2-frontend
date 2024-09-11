import Divider from 'components/common/Divider'
import Text from 'components/common/Text'

export function Or() {
  return (
    <div className='flex items-center gap-2'>
      <Divider />
      <Text size='xs' className='text-white/40'>
        OR
      </Text>
      <Divider />
    </div>
  )
}
