import classNames from 'classnames'

import AccordionContent from './AccordionContent'
import Card from './Card'

interface Props {
  items: Item[]
  allowMultipleOpen?: boolean
  className?: string
}

export default function Accordion(props: Props) {
  if (props.allowMultipleOpen) {
    return (
      <>
        {props.items.map((item, index) => (
          <AccordionContent key={index} item={item} index={index} />
        ))}
      </>
    )
  }

  return (
    <div className={classNames('w-full', props.className)}>
      {props.items.map((item, index) => (
        <Card key={index} className='mb-4'>
          <AccordionContent item={item} index={index} />
        </Card>
      ))}
    </div>
  )
}
