import classNames from 'classnames'

interface Props {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export default function Divider(props: Props) {
  return (
    <div
      className={classNames(
        props.orientation === 'vertical' ? 'h-full w-[1px]' : 'h-[1px] w-full',
        props.className,
        'bg-white/10',
      )}
    ></div>
  )
}
