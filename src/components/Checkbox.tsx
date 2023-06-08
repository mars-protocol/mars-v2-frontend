import classNames from 'classnames'
import { Check } from './Icons'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function Checkbox(props: Props) {
  return (
    <button
      onClick={() => props.onChange(props.checked)}
      className={classNames(
        'h-5 w-5 rounded-sm p-0.5',
        props.checked && 'relative isolate overflow-hidden rounded-sm',
        props.checked &&
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
        props.checked ? 'bg-white/20' : 'border border-white/60',
      )}
    >
      {props.checked && <Check />}
    </button>
  )
}
