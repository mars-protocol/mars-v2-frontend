import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'

interface Props {
  description: string
}

export function Callout(props: Props) {
  return (
    <div className='flex py-2 pl-3 pr-4 gap-2 bg-purple/10 text-purple rounded'>
      <div className='w-5'>
        <InfoCircle />
      </div>
      <Text size='xs'>{props.description}</Text>
    </div>
  )
}
