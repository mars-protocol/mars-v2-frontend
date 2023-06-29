import classNames from 'classnames'

import Text from 'components/Text'

interface Props {
  title: string | React.ReactNode
  sub: string | React.ReactNode
  className?: string
  containerClassName?: string
}

export default function TitleAndSubCell(props: Props) {
  return (
    <div className={classNames('flex flex-col gap-[0.5]', props.containerClassName)}>
      <Text size='xs' className={props.className}>
        {props.title}
      </Text>
      <Text size='xs' className={classNames('text-white/50', props.className)}>
        {props.sub}
      </Text>
    </div>
  )
}
