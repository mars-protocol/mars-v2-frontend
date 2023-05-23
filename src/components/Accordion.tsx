import Card from 'components/Card'

import AccordionContent, { Item } from './AccordionContent'

interface Props {
  items: Item[]
  allowMultipleOpen?: boolean
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
    <div className='w-full'>
      {props.items.map((item, index) => (
        <Card key={item.title} className='mb-4'>
          <AccordionContent item={item} index={index} />
        </Card>
      ))}
    </div>
  )
}
