import React from 'react'

import TradeChart from 'components/Trade/TradeChart'
import { ASSETS } from 'constants/assets'

export function PerpsChart() {
  return (
    <div className='h-full'>
      <TradeChart buyAsset={ASSETS[0]} sellAsset={ASSETS[1]} />
    </div>
  )
}
