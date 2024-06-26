import classNames from 'classnames'

import SwapForm from 'components/trade/TradeModule/SwapForm'
import useChainConfig from 'hooks/chain/useChainConfig'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  isAdvanced: boolean
}

export default function TradeModule(props: Props) {
  const { buyAsset, sellAsset, isAdvanced } = props
  const chainConfig = useChainConfig()

  return (
    <div className='order-3 md:order-2 md:row-span-2'>
      <div
        className={classNames(
          'md:min-h-[850px]',
          'relative isolate max-w-full overflow-hidden rounded-base pb-4 z-30 flex flex-wrap flex-col justify-between',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
        )}
      >
        <SwapForm
          buyAsset={buyAsset}
          sellAsset={sellAsset}
          isAdvanced={isAdvanced}
          chainConfig={chainConfig}
        />
      </div>
    </div>
  )
}
