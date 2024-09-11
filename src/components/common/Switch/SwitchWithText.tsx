import classNames from 'classnames'

interface Props {
  name: string
  options: SwitchOption[]
  selected: SwitchOption['value']
  onChange: (value: SwitchOption['value']) => void
  className?: string
  disabled?: boolean
}

export default function SwitchWithText(props: Props) {
  if (props.options.length !== 2) return null

  return (
    <div
      className={classNames(
        'relative transition-opacity bg-black/20 rounded-md w-full p-0.5',
        props.className,
        props.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <span
        className={classNames(
          'absolute left-0 top-0 z-1 h-full w-1/2 rounded-md bg-white/20 transition-transform',
          props.selected === props.options[1].value && 'translate-x-full',
        )}
      />
      <div className='flex items-center justify-center h-full'>
        {props.options.map((option, index) => (
          <div
            key={option.value}
            onClick={() => {
              if (props.selected === option.value) return
              props.onChange(option.value)
            }}
            className={classNames(
              props.selected === option.value ? 'text-white' : 'text-white/30 hover:cursor-pointer',
              'w-1/2 h-full flex items-center justify-center p-2 z-2',
            )}
          >
            {option.text}
          </div>
        ))}
      </div>
    </div>
  )
}
