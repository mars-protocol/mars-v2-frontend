import React from 'react'

import TradeChart from 'components/Trade/TradeChart'
import useAllAssets from 'hooks/assets/useAllAssets'

export function PerpsChart() {
  const assets = useAllAssets()
  return (
    <div className='h-full'>
      <TradeChart buyAsset={assets[0]} sellAsset={assets[1]} />
    </div>
  )
}
