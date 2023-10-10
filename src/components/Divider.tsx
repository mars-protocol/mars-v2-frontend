import classNames from 'classnames'

interface Props {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export default function Divider(props: Props) {
  if (props.orientation === 'vertical') {
    return <div className={classNames('h-full w-[1px] bg-white/10', props.className)}></div>
  }
  return <div className={classNames('h-[1px] w-full bg-white/10', props.className)}></div>
}
