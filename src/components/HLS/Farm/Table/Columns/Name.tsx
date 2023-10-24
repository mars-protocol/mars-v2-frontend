import React from 'react'

import TitleAndSubCell from 'components/TitleAndSubCell'

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
