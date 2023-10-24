import React from 'react'

import { ChevronDown, ChevronUp } from 'components/Icons'

export const MANAGE_META = { accessorKey: 'manage', enableSorting: false, header: 'Manage' }

interface Props {
  isExpanded: boolean
}

export default function Manage(props: Props) {
  return (
    <div className='flex items-center justify-end'>
      <div className='w-4'>{props.isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
    </div>
  )
}
