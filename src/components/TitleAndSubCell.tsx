import classNames from 'classnames'

import Text from 'components/Text'

interface Props {
  title: string | React.ReactNode
  sub: string | React.ReactNode
  className?: string
}

export default function TitleAndSubCell(props: Props) {
  return (
    <div className='flex flex-col gap-[0.5]'>
      <Text size='sm' className={props.className}>
        {props.title}
      </Text>
      <Text size='sm' className={classNames('text-white/50', props.className)}>
        {props.sub}
      </Text>
    </div>
  )
}
