import classNames from 'classnames'

import AccordionContent from 'components/common/AccordionContent'
import Card from 'components/common/Card'

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
        <Card key={index}>
          <AccordionContent item={item} index={index} />
        </Card>
      ))}
    </div>
  )
}
