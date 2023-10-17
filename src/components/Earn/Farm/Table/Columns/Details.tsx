import classNames from 'classnames'
import React from 'react'

import { ChevronDown } from 'components/Icons'
import Loading from 'components/Loading'

interface Props {
  isLoading: boolean
  isExpanded: boolean
}

export default function Details(props: Props) {
  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <div className={classNames('w-4', props.isExpanded && 'rotate-180')}>
        <ChevronDown />
      </div>
    </div>
  )
}
