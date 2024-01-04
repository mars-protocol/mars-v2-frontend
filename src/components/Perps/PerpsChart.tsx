import React from 'react'

import TradeChart from 'components/Trade/TradeChart'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

export function PerpsChart() {
  const assets = useAllAssets()
  const { perpsAsset } = usePerpsAsset()

  return (
    <div className='h-full'>
      <TradeChart buyAsset={perpsAsset} sellAsset={assets[1]} />
    </div>
  )
}
