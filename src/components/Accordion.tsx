import Card from 'components/Card'
import { Plus, Subtract } from 'components/Icons'
import { Text } from 'components/Text'

interface Props {
  items: Item[]
}

interface Item {
  title: string
  content: React.ReactNode
}

export default function Accordion(props: Props) {
  return (
    <Card>
      {props.items.map((item, index) => (
        <details key={item.title} className='group border-b-white/10 [&:not(:last-child)]:border-b'>
          <summary className='mb-0 flex cursor-pointer items-center justify-between border-t border-white/10 bg-white/10 p-4 text-white group-[&:first-child]:border-t-0 group-[[open]]:border-b [&::marker]:hidden [&::marker]:content-[""]'>
            <Text>{item.title}</Text>
            <div className='block h-[14px] w-[14px] group-[[open]]:hidden'>
              <Plus />
            </div>
            <div className='hidden h-[1px] w-[14px] group-[[open]]:block'>
              <Subtract />
            </div>
          </summary>
          <div className='bg-white/5 p-4'>{item.content}</div>
        </details>
      ))}
    </Card>
  )
}
