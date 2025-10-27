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
    <div className='order-3 md:order-2 md:row-span-2 min-h-full bg-surface'>
      <div
        className={classNames(
          'md:min-h-[850px] md:h-full pb-10',
          'relative isolate max-w-full z-30 flex flex-col',
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
