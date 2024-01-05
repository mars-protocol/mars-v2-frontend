import classNames from 'classnames'

import Text from 'components/Text'

export const PERP_TYPE_META = { accessorKey: 'type', header: 'Side' }

type Props = {
  type: PerpsType
}

export default function PerpType(props: Props) {
  return (
    <Text
      size='xs'
      className={classNames(
        'capitalize  px-1 py-0.5 rounded-sm inline',
        props.type === 'short' && 'text-error bg-error/20',
        props.type === 'long' && 'text-success bg-success/20',
      )}
    >
      {props.type}
    </Text>
  )
}
