import classNames from 'classnames'

import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import AssetItem from 'components/Trade/TradeModule/AssetSelector/AssetItem'
import useMarketAssets from 'hooks/useMarketAssets'
import { byDenom } from 'utils/array'

interface Props {
  type: 'buy' | 'sell'
  assets: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAsset: (asset: Asset) => void
}

export default function AssetList(props: Props) {
  const { data: marketAssets } = useMarketAssets()

  return (
    <section>
      <button
        className='flex w-full items-center justify-between bg-black/20 p-4'
        onClick={props.toggleOpen}
      >
        <Text>{props.type === 'buy' ? 'Buy asset' : 'Sell asset'}</Text>
        <ChevronDown className={classNames(props.isOpen && '-rotate-180', 'w-4')} />
      </button>
      {props.isOpen &&
        (props.assets.length === 0 ? (
          <Text size='xs' className='p-4'>
            No available assets found
          </Text>
        ) : (
          <ul>
            {props.assets.map((asset) => (
              <AssetItem
                key={`${props.type}-${asset.symbol}`}
                asset={asset}
                onSelectAsset={props.onChangeAsset}
                depositCap={
                  props.type === 'buy' ? marketAssets?.find(byDenom(asset.denom))?.cap : undefined
                }
              />
            ))}
          </ul>
        ))}
    </section>
  )
}
