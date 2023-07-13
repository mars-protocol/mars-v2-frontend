import { useState } from 'react'

import OrderBook from 'components/Trade/OrderBook'
import TradeChart from 'components/Trade/TradeChart'
import TradeModule from 'components/Trade/TradeModule'
import { getEnabledMarketAssets } from 'utils/assets'

export default function TradePage() {
  const enabledMarketAssets = getEnabledMarketAssets()
  const [buyAsset, setBuyAsset] = useState(enabledMarketAssets[0])
  const [sellAsset, setSellAsset] = useState(enabledMarketAssets[1])

  return (
    <div className='grid h-full w-full grid-cols-[346px_auto] gap-4'>
      <TradeModule
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        onChangeBuyAsset={setBuyAsset}
        onChangeSellAsset={setSellAsset}
      />
      <TradeChart buyAsset={buyAsset} sellAsset={sellAsset} />
      <OrderBook />
    </div>
  )
}
