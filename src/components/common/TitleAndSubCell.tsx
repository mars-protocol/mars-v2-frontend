import classNames from 'classnames'

import Text from 'components/common/Text'

interface Props {
  title: string | React.ReactNode
  sub: string | React.ReactNode
  className?: string
  containerClassName?: string
  isDeprecated?: boolean
}

export default function TitleAndSubCell(props: Props) {
  return (
    <div className={classNames('flex flex-col gap-0.5', props.containerClassName)}>
      <Text size='xs' className={props.className} tag='span'>
        {props.title}
        {props.isDeprecated && <span className='text-info ml-1'>(disabled)</span>}
      </Text>
      <Text size='xs' className={classNames('text-white/40', props.className)} tag='span'>
        {props.sub}
      </Text>
    </div>
  )
}
