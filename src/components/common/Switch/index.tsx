import classNames from 'classnames'

interface Props {
  name: string
  checked: boolean
  onChange: (value: boolean) => void
  className?: string
  disabled?: boolean
}

export default function Switch(props: Props) {
  return (
    <div
      className={classNames(
        'relative transition-opacity',
        props.className,
        props.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <input
        type='checkbox'
        id={props.name}
        name={props.name}
        className={classNames('peer hidden')}
        checked={props.checked}
        onChange={() => props.onChange(!props.checked)}
      />
      <label
        htmlFor={props.name}
        className={classNames(
          'isolate flex hover:cursor-pointer items-center justify-between overflow-hidden',
          'relative h-5 w-10 rounded-full bg-white/10 shadow-sm',
          'before:content-[" "] before:absolute before:left-[1px] before:top-[1px]',
          'before:z-1 before:m-0.5 before:h-3.5 before:w-3.5 before:rounded-full before:bg-white before:transition-transform',
          'peer-checked:active group peer-checked:before:translate-x-5',
        )}
      >
        <span
          className={classNames(
            'absolute inset-0 bg-martian-red opacity-0 transition-opacity',
            props.checked && 'opacity-100',
          )}
        />
      </label>
    </div>
  )
}
