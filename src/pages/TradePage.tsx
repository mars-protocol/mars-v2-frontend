import { useState } from 'react'

import MigrationBanner from 'components/MigrationBanner'
import AccountDetailsCard from 'components/Trade/AccountDetailsCard'
import TradeChart from 'components/Trade/TradeChart'
import TradeModule from 'components/Trade/TradeModule'
import { getEnabledMarketAssets } from 'utils/assets'

export default function TradePage() {
  const enabledMarketAssets = getEnabledMarketAssets()
  const [buyAsset, setBuyAsset] = useState(enabledMarketAssets[0])
  const [sellAsset, setSellAsset] = useState(enabledMarketAssets[1])

  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <MigrationBanner />
      <div className='grid h-full w-full grid-cols-[346px_auto] gap-4'>
        <TradeModule
          buyAsset={buyAsset}
          sellAsset={sellAsset}
          onChangeBuyAsset={setBuyAsset}
          onChangeSellAsset={setSellAsset}
        />
        <TradeChart buyAsset={buyAsset} sellAsset={sellAsset} />
        <div />
        <AccountDetailsCard />
      </div>
    </div>
  )
}
