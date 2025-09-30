import classNames from 'classnames'

import { ChevronDown, ChevronRight } from 'components/common/Icons'
import Text from 'components/common/Text'

interface Props {
  item: Item
  index: number
}

export default function AccordionContent(props: Props) {
  const { title, renderContent, isOpen, renderSubTitle, toggleOpen } = props.item

  return (
    <div key={title} className='group/accordion'>
      <div
        onClick={() => toggleOpen(props.index)}
        className={classNames(
          'w-full mb-0 flex hover:cursor-pointer items-center justify-between bg-surface-dark py-2 px-4 text-white',
          '[&::marker]:hidden [&::marker]:content-[""]',
        )}
      >
        <div>
          <Text size='sm' className='font-semibold'>
            {title}
          </Text>
          {renderSubTitle()}
        </div>
        <div className='block pr-1 group-[[open]]/accordion:hidden'>
          {isOpen ? <ChevronDown className='w-3' /> : <ChevronRight className='w-1.5' />}
        </div>
      </div>
      <div
        className={classNames(
          'grid transition-[grid-template-rows]',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className='overflow-x-scroll overflow-y-hidden md:overflow-hidden'>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
