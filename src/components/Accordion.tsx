import classNames from 'classnames'

import Card from 'components/Card'
import { ChevronDown, ChevronRight } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  items: Item[]
  allowMultipleOpen?: boolean
}

interface Item {
  title: string
  content: React.ReactNode
  isOpen?: boolean
  toggleOpen: (index: number) => void
}

export default function Accordion(props: Props) {
  return (
    <Card className='w-full'>
      {props.items.map((item, index) => (
        <div key={item.title} className='group border-b-white/10 [&:not(:last-child)]:border-b'>
          <div
            onClick={() => item.toggleOpen(index)}
            className={classNames(
              'mb-0 flex cursor-pointer items-center justify-between border-t border-white/10 bg-white/10 p-4 text-white',
              'group-[&:first-child]:border-t-0 group-[[open]]:border-b',
              '[&::marker]:hidden [&::marker]:content-[""]',
              item.isOpen && 'border-b [&:first-child]:border-t-0',
            )}
          >
            <Text>{item.title}</Text>
            <div className='block pr-1 group-[[open]]:hidden'>
              {item.isOpen ? <ChevronRight /> : <ChevronDown />}
            </div>
          </div>
          {item.isOpen && <div className='bg-white/5 transition-[padding]'>{item.content}</div>}
        </div>
      ))}
    </Card>
  )
}
