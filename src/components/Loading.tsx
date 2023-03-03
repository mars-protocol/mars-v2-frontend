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
            'animate-pulse rounded-base bg-white/40',
            props.className,
            props.height ? `h-[${props.height}px]` : 'h-[300px]',
            props.width ? `w-[${props.width}px]` : 'w-full',
          )}
          key={i}
        />
      ))}
      <span className='sr-only'>Loading...</span>
    </>
  )
}
