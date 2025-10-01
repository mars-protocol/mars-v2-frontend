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
    <div className='order-3 md:order-2 md:row-span-2 h-full'>
      <div
        className={classNames(
          'md:min-h-[850px] md:h-full',
          'relative isolate max-w-full overflow-hidden pb-4 z-30 flex flex-wrap flex-col bg-surface',
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
