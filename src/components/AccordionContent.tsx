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
  subTitle?: string | React.ReactNode
  toggleOpen: (index: number) => void
}

export default function AccordionContent(props: Props) {
  const { title, renderContent, isOpen, subTitle, toggleOpen } = props.item

  const shouldShowSubTitle = subTitle && !isOpen

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
          {shouldShowSubTitle && (
            <Text size='xs' className='mt-1 text-white/60'>
              {subTitle}
            </Text>
          )}
        </div>
        <div className='block pr-1 group-[[open]]:hidden'>
          {isOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
      </div>
      {isOpen && <div className='bg-white/5 transition-[padding]'>{renderContent()}</div>}
    </div>
  )
}
