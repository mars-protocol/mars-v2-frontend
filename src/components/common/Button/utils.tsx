import classNames from 'classnames'

export function glowElement(enableAnimations: boolean, className?: string) {
  return (
    <svg
      className={classNames(
        enableAnimations && 'group-hover:animate-glow group-focus:animate-glow',
        'glow-container isolate opacity-0',
        'pointer-events-none absolute inset-0 h-full w-full',
      )}
    >
      <rect
        pathLength='100'
        strokeLinecap='round'
        width='100%'
        height='100%'
        rx='4'
        x='0'
        y='0'
        className='absolute glow-line group-hover:glow-hover group-focus:glow-hover'
      />
    </svg>
  )
}
