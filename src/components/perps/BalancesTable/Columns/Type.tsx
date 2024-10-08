import Text from 'components/common/Text'

export const TYPE_META = {
  accessorKey: 'type',
  header: 'Type',
  id: 'type',
  meta: { className: 'min-w-20 w-20' },
}

interface Props {
  type: PerpsPosition['type']
}

export function Type(props: Props) {
  return (
    <Text size='xs' className='inline-block px-2 py-0.5 capitalize text-white/80'>
      {props.type}
    </Text>
  )
}
