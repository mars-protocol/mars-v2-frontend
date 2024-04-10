import Text from 'components/common/Text'
import { capitalizeFirstLetter } from 'utils/helpers'

export const TYPE_META = {
  accessorKey: 'type',
  header: 'Type',
  id: 'type',
  meta: { className: 'min-w-20 w-20' },
}

interface Props {
  type: PerpsPositionType
}

export function Type(props: Props) {
  return (
    <Text size='xs' className='text-white/60'>
      {capitalizeFirstLetter(props.type)}
    </Text>
  )
}
