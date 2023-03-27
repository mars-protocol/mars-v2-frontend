import { Plus, Subtract } from './Icons'
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
    <div className='before:content-[" "] relative z-1 max-w-full flex-wrap items-start overflow-hidden rounded-base before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas'>
      {props.items.map((item, index) => (
        <div>
          <h2 className='mb-0' id={`heading${index}`}>
            <button
              className='group relative flex w-full items-center justify-between border-0 bg-white/10 py-4 px-5 text-left [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none'
              type='button'
              data-te-collapse-init
              data-te-collapse-collapsed
              data-te-target={`#collapse${index}`}
              aria-expanded='false'
              aria-controls={`collapse${index}`}
            >
              <Text>{item.title}</Text>
              <span className='hidden h-5 w-5 items-center group-[[data-te-collapse-collapsed]]:flex'>
                <Plus />
              </span>
              <span className='flex h-5 w-5 items-center group-[[data-te-collapse-collapsed]]:hidden'>
                <Subtract />
              </span>
            </button>
          </h2>
          <div
            id={`collapse${index}`}
            className='!visible hidden'
            data-te-collapse-item
            aria-labelledby={`heading${index}`}
          >
            <div className='bg-white/5 py-4 px-5'>{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
