import classNames from 'classnames'

import AssetSelector from 'components/Trade/TradeModule/AssetSelector'
import SwapForm from 'components/Trade/TradeModule/SwapForm'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function TradeModule(props: Props) {
  const { buyAsset, sellAsset } = props

  return (
    <div className='row-span-2'>
      <div
        className={classNames(
          'relative isolate max-w-full overflow-hidden rounded-base pb-4 z-30 min-h-full flex flex-wrap flex-col justify-between',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
        )}
      >
        <SwapForm buyAsset={buyAsset} sellAsset={sellAsset} />
      </div>
    </div>
  )
}
