import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'

interface Props {
  children: string
}

export function Callout(props: Props) {
  return (
    <div className='grid grid-cols-[20px,auto] py-2 pl-3 pr-4 gap-2 bg-purple/10 text-purple rounded items-center'>
      <InfoCircle />
      <Text size='xs'>{props.children}</Text>
    </div>
  )
}
