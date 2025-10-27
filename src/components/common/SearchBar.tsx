import classNames from 'classnames'
import React, { ChangeEvent, LegacyRef } from 'react'

import { Search } from 'components/common/Icons'

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
        'flex w-full items-center justify-between rounded-sm p-2.5',
        'relative isolate max-w-full overflow-hidden rounded-sm bg-surface-dark',
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
