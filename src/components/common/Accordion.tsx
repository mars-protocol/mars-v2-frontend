import classNames from 'classnames'

import AccordionContent, { Item } from 'components/common/AccordionContent'
import Card from 'components/common/Card'

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
          <AccordionContent key={index} item={item} index={index} />
        ))}
      </Card>
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
