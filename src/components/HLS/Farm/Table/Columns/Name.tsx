import React from 'react'

import TitleAndSubCell from 'components/TitleAndSubCell'

export const NAME_META = { id: 'name', accessorKey: 'denoms.primary', header: 'Name' }

interface Props {
  strategy: HLSStrategy
}

export default function Name(props: Props) {
  return (
    <div className='flex'>
      <TitleAndSubCell
        className='ml-2 mr-2 text-left'
        title={`${props.strategy.denoms.deposit}-${props.strategy.denoms.borrow}`}
        sub={'Via Mars'}
      />
    </div>
  )
}
