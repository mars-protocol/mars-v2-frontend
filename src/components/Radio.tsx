import classNames from 'classnames'

interface Props {
  active?: boolean
  className?: string
}

export default function Radio(props: Props) {
  return (
    <div
      className={classNames(
        'group flex h-5 w-5 items-center justify-center rounded-full border',
        props.active && 'border-primary',
      )}
    >
      <span
        className={classNames(
          'h-3 w-3 rounded-full',
          props.active
            ? 'bg-primary'
            : 'bg-white opacity-0 transition-opacity group-hover:opacity-100',
          props.className,
        )}
      />
    </div>
  )
}
