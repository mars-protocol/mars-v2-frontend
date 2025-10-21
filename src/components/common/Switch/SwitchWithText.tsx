import classNames from 'classnames'
import { SortNone } from 'components/common/Icons'

interface Props {
  options: SwitchOption[]
  selected: SwitchOption['value']
  onChange: (value: SwitchOption['value']) => void
  className?: string
  disabled?: boolean
  subtle?: boolean
  toggle?: boolean
}

export default function SwitchWithText(props: Props) {
  if (props.options.length !== 2) return null

  if (props.toggle) {
    const selectedOption = props.options.find((option) => option.value === props.selected)

    return (
      <div
        onClick={() => {
          if (props.disabled) return
          const otherOption = props.options.find((option) => option.value !== props.selected)
          if (otherOption) props.onChange(otherOption.value)
        }}
        className={classNames(
          'inline-flex items-center gap-0.5 p-0 cursor-pointer group',
          props.className,
          props.disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className='text-white'>{selectedOption?.text}</span>
        <span className='w-5 text-white group-hover:opacity-100 opacity-60'>
          <SortNone />
        </span>
      </div>
    )
  }

  if (props.subtle) {
    return (
      <div className={classNames('inline-flex items-center', props.className)}>
        {props.options.map((option) => (
          <div
            key={option.value}
            onClick={() => {
              if (props.disabled || props.selected === option.value) return
              props.onChange(option.value)
            }}
            className={classNames(
              'px-2 py-1 text-xs transition-colors cursor-pointer',
              props.selected === option.value ? 'text-white' : 'text-white/40 hover:text-white/60',
              props.disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {option.text}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={classNames(
        'relative transition-opacity bg-black/20 rounded-sm w-full p-0.5',
        props.className,
        props.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <span
        className={classNames(
          'absolute left-0 top-0 z-1 h-full w-1/2 rounded-sm bg-white/10 transition-transform',
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
