import { ChevronDown, ChevronUp } from 'components/common/Icons'

export const CHEVRON_META = {
  id: 'chevron',
  enableSorting: false,
  header: '',
  meta: {
    className: 'w-5',
  },
}

interface Props {
  isExpanded: boolean
}
export default function Chevron(props: Props) {
  return (
    <div className='flex items-center justify-end'>
      <div className='w-4'>{props.isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
    </div>
  )
}
