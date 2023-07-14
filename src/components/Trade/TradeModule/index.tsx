import classNames from 'classnames'
import { useState } from 'react'

import Divider from 'components/Divider'
import RangeInput from 'components/RangeInput'
import AssetSelector from 'components/Trade/TradeModule/AssetSelector'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  onChangeBuyAsset: (asset: Asset) => void
  onChangeSellAsset: (asset: Asset) => void
}

export default function TradeModule(props: Props) {
  const [value, setValue] = useState(0)

  return (
    <div
      className={classNames(
        'relative isolate max-w-full overflow-hidden rounded-base',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
        'row-span-2 h-full',
      )}
    >
      <AssetSelector
        buyAsset={props.buyAsset}
        sellAsset={props.sellAsset}
        onChangeBuyAsset={props.onChangeBuyAsset}
        onChangeSellAsset={props.onChangeSellAsset}
      />
      <Divider />
      <RangeInput
        max={4000}
        marginThreshold={2222}
        value={value}
        onChange={setValue}
        wrapperClassName='p-4'
      />
    </div>
  )
}
