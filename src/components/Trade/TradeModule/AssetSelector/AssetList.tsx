import classNames from 'classnames'

import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import AssetItem from 'components/Trade/TradeModule/AssetSelector/AssetItem'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useMarketAssets from 'hooks/useMarketAssets'
import { useMemo } from 'react'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getEnabledMarketAssets } from 'utils/assets'

interface Props {
  type: 'buy' | 'sell'
  assets: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAsset: (asset: Asset) => void
}

export default function AssetList(props: Props) {
  const account = useCurrentAccount()
  const { data: marketAssets } = useMarketAssets()
  const balances = useMemo(() => {
    if (!account) return []
    return getMergedBalancesForAsset(account, getEnabledMarketAssets())
  }, [account])

  return (
    <section>
      <button
        className='flex items-center justify-between w-full p-4 bg-black/20'
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
                balances={balances}
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
