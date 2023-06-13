import classNames from 'classnames'
import { ChangeEvent } from 'react'

import { Search } from 'components/Icons'

interface Props {
  value: string
  placeholder: string
  onChange: (value: string) => void
}

export default function SearchBar(props: Props) {
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    props.onChange(event.target.value)
  }

  return (
    <div
      className={classNames(
        'flex w-full items-center justify-between rounded-sm bg-white/10 p-2.5',
        'relative isolate max-w-full overflow-hidden rounded-base',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
      )}
    >
      <Search width={14} height={14} className='mr-2.5 text-white' />
      <input
        value={props.value}
        className='h-full w-full bg-transparent text-xs placeholder-white/30 outline-none'
        placeholder={props.placeholder}
        onChange={(event) => onChange(event)}
      />
    </div>
  )
}
