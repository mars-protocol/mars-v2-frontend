import classNames from 'classnames'

import AccordionContent from 'components/common/AccordionContent'
import Card from 'components/common/Card'

interface Props {
  items: Item[]
  allowMultipleOpen?: boolean
  className?: string
  allowOverflow?: boolean
}

export default function Accordion(props: Props) {
  if (props.allowMultipleOpen) {
    return (
      <>
        {props.items.map((item, index) => (
          <AccordionContent
            key={index}
            item={item}
            index={index}
            allowOverflow={props.allowOverflow}
          />
        ))}
      </>
    )
  }

  return (
    <div className={classNames('w-full', props.className)}>
      {props.items.map((item, index) => (
        <Card key={index} className='mb-4'>
          <AccordionContent item={item} index={index} allowOverflow={props.allowOverflow} />
        </Card>
      ))}
    </div>
  )
}
