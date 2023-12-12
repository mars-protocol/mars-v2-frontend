import classNames from 'classnames'

import SwapForm from 'components/Trade/TradeModule/SwapForm'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  isAdvanced: boolean
}

export default function TradeModule(props: Props) {
  const { buyAsset, sellAsset, isAdvanced } = props
  return (
    <div className='row-span-2'>
      <div
        className={classNames(
          'max-h-[calc(100dvh-98px)] h-[980px] min-h-[830px]',
          'relative isolate max-w-full overflow-hidden rounded-base pb-4 z-30 flex flex-wrap flex-col justify-between',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
        )}
      >
        <SwapForm buyAsset={buyAsset} sellAsset={sellAsset} isAdvanced={isAdvanced} />
      </div>
    </div>
  )
}
