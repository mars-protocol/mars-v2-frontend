import classNames from 'classnames'

interface Props {
  className?: string
  count?: number
  height?: number
  width?: number
}

export default function Loading(props: Props) {
  return (
    <>
      {Array.from({ length: props.count ?? 1 }, (_, i) => (
        <div
          role='status'
          className={classNames(
            'animate-pulse rounded-full bg-white/40',
            props.className,
            props.height ? `h-${props.height}` : 'h-3',
            props.width ? `w-${props.width}` : 'w-full',
          )}
          key={i}
        />
      ))}
      <span className='sr-only'>Loading...</span>
    </>
  )
}
