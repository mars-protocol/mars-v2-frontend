import Card from 'components/Card'

import AccordionContent, { Item } from './AccordionContent'
import classNames from 'classnames'

interface Props {
  items: Item[]
  allowMultipleOpen?: boolean
  className?: string
}

export default function Accordion(props: Props) {
  if (props.allowMultipleOpen) {
    return (
      <Card className='w-full'>
        {props.items.map((item, index) => (
          <AccordionContent key={item.title} item={item} index={index} />
        ))}
      </Card>
    )
  }

  return (
    <div className={classNames('w-full', props.className)}>
      {props.items.map((item, index) => (
        <Card key={item.title} className='mb-4'>
          <AccordionContent item={item} index={index} />
        </Card>
      ))}
    </div>
  )
}
