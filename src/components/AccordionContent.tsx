import classNames from 'classnames'

import { ChevronDown, ChevronRight } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  item: Item
  index: number
}

export interface Item {
  title: string
  renderContent: () => React.ReactNode
  isOpen?: boolean
  toggleOpen: (index: number) => void
}

export default function AccordionContent(props: Props) {
  return (
    <div key={props.item.title} className='group border-b-white/10 [&:not(:last-child)]:border-b'>
      <div
        onClick={() => props.item.toggleOpen(props.index)}
        className={classNames(
          'mb-0 flex cursor-pointer items-center justify-between border-t border-white/10 bg-white/10 p-4 text-white',
          'group-[&:first-child]:border-t-0 group-[[open]]:border-b',
          '[&::marker]:hidden [&::marker]:content-[""]',
          props.item.isOpen && 'border-b [&:first-child]:border-t-0',
        )}
      >
        <Text>{props.item.title}</Text>
        <div className='block pr-1 group-[[open]]:hidden'>
          {props.item.isOpen ? <ChevronRight /> : <ChevronDown />}
        </div>
      </div>
      {props.item.isOpen && (
        <div className='bg-white/5 transition-[padding]'>{props.item.renderContent()}</div>
      )}
    </div>
  )
}
