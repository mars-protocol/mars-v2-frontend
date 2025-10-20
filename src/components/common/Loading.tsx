import classNames from 'classnames'

interface Props {
  className?: string
  count?: number
}

export default function Loading(props: Props) {
  return (
    <>
      {Array.from({ length: props.count ?? 1 }, (_, i) => (
        <div
          role='status'
          className={classNames(
            'max-w-full animate-pulse bg-white/40',
            props.className ? props.className : 'h-4 w-full',
          )}
          key={i}
        />
      ))}
      <span className='sr-only'>Loading...</span>
    </>
  )
}
