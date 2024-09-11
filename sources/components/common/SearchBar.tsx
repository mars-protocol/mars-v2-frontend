import classNames from 'classnames'
import React, { ChangeEvent, LegacyRef } from 'react'

import { Search } from './Icons'

interface Props {
  value: string
  placeholder: string
  autoFocus?: boolean
  onChange: (value: string) => void
}

const SearchBar = (props: Props, ref: LegacyRef<HTMLDivElement>) => {
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
      ref={ref}
    >
      <div className='w-3.5 h-3.5 mr-2.5 text-white'>
        <Search />
      </div>
      <input
        value={props.value}
        className='w-full h-full text-xs bg-transparent outline-none placeholder-white/50'
        placeholder={props.placeholder}
        onChange={(event) => onChange(event)}
        autoFocus={props.autoFocus}
      />
    </div>
  )
}

export default React.forwardRef(SearchBar)
