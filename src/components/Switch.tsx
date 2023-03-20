import classNames from 'classnames'

interface Props {
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export default function Toggle(props: Props) {
  return (
    <div className={classNames('relative', props.className)}>
      <input
        type='checkbox'
        id={props.name}
        name={props.name}
        className={classNames('peer hidden')}
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <label
        htmlFor={props.name}
        className={classNames(
          'flex cursor-pointer items-center justify-between',
          'relative h-5 w-10 rounded-full bg-white/20 shadow-sm',
          'before:content-[" "] before:absolute before:left-[1px] before:top-[1px]',
          'before:z-1 before:h-4.5 before:w-4.5 before:rounded-full before:bg-white before:transition-transform',
          'peer-checked:gradient-primary-to-secondary peer-checked:before:translate-x-5',
        )}
      ></label>
    </div>
  )
}
