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
  renderSubTitle: () => React.ReactNode
  toggleOpen: (index: number) => void
}

export default function AccordionContent(props: Props) {
  const { title, renderContent, isOpen, renderSubTitle, toggleOpen } = props.item

  return (
    <div key={title} className='group border-b-white/10 [&:not(:last-child)]:border-b'>
      <div
        onClick={() => toggleOpen(props.index)}
        className={classNames(
          'mb-0 flex cursor-pointer items-center justify-between border-t border-white/10 bg-white/10 p-4 text-white',
          'group-[&:first-child]:border-t-0 group-[[open]]:border-b',
          '[&::marker]:hidden [&::marker]:content-[""]',
          isOpen && 'border-b [&:first-child]:border-t-0',
        )}
      >
        <div>
          <Text>{title}</Text>
          {renderSubTitle()}
        </div>
        <div className='block pr-1 group-[[open]]:hidden'>
          {isOpen ? <ChevronDown className='h-1.5' /> : <ChevronRight className='w-1.5' />}
        </div>
      </div>
      {isOpen && <div className='bg-white/5 transition-[padding]'>{renderContent()}</div>}
    </div>
  )
}
