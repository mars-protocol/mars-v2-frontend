import classNames from 'classnames'
import { ChangeEvent, forwardRef } from 'react'

import { Search } from 'components/Icons'

interface Props {
  value: string
  placeholder: string
  autofocus?: boolean
  onChange: (value: string) => void
}

const SearchBar = (props: Props) => {
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    props.onChange(event.target.value)
  }

  return (
    <div
      className={classNames(
        'flex w-full items-center justify-between rounded-sm bg-white/10 p-2.5',
        'relative isolate max-w-full overflow-hidden rounded-sm',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
      )}
    >
      <Search width={14} height={14} className='mr-2.5 text-white' />
      <input
        value={props.value}
        className='h-full w-full bg-transparent text-xs placeholder-white/30 outline-none'
        placeholder={props.placeholder}
        onChange={(event) => onChange(event)}
        autoFocus={props.autofocus}
      />
    </div>
  )
}

export default forwardRef(SearchBar)
