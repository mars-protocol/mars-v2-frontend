import { ChevronDown, ChevronUp } from 'components/common/Icons'

export const MANAGE_META = {
  accessorKey: 'manage',
  enableSorting: false,
  header: 'Manage',
  meta: {
    className: 'w-30',
  },
}

interface Props {
  isExpanded: boolean
}
export default function Manage(props: Props) {
  return (
    <div className='flex items-center justify-end'>
      <div className='w-4'>{props.isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
    </div>
  )
}
