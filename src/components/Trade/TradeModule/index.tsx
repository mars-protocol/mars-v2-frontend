import classNames from 'classnames'

import AssetSelector from 'components/Trade/TradeModule/AssetSelector'
import SwapForm from 'components/Trade/TradeModule/SwapForm'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  onChangeBuyAsset: (asset: Asset) => void
  onChangeSellAsset: (asset: Asset) => void
}

export default function TradeModule(props: Props) {
  const { buyAsset, sellAsset, onChangeBuyAsset, onChangeSellAsset } = props

  return (
    <div
      className={classNames(
        'relative isolate max-w-full overflow-hidden rounded-base',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
        'h-full',
      )}
    >
      <AssetSelector
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        onChangeBuyAsset={onChangeBuyAsset}
        onChangeSellAsset={onChangeSellAsset}
      />

      <SwapForm buyAsset={buyAsset} sellAsset={sellAsset} />
    </div>
  )
}
