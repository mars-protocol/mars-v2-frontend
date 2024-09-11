import classNames from 'classnames'

import Text from './Text'

interface Props {
  title: string | React.ReactNode
  sub: string | React.ReactNode
  className?: string
  containerClassName?: string
}

export default function TitleAndSubCell(props: Props) {
  return (
    <div className={classNames('flex flex-col gap-0.5', props.containerClassName)}>
      <Text size='xs' className={props.className} tag='span'>
        {props.title}
      </Text>
      <Text size='xs' className={classNames('text-white/40', props.className)} tag='span'>
        {props.sub}
      </Text>
    </div>
  )
}
