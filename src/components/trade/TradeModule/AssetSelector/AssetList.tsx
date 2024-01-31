import classNames from 'classnames'
import { useMemo } from 'react'

import { ChevronDown } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetSelectorItem from 'components/trade/TradeModule/AssetSelector/AssetSelectorItem'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useMarkets from 'hooks/markets/useMarkets'
import useChainConfig from 'hooks/useChainConfig'
import usePrices from 'hooks/usePrices'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { sortAssetsOrPairs } from 'utils/assets'

interface Props {
  type: 'buy' | 'sell' | 'perps'
  assets: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAsset: (asset: Asset | AssetPair) => void
}

export default function AssetList(props: Props) {
  const chainConfig = useChainConfig()
  const baseDenom = chainConfig.assets[0].denom
  const { assets, type, isOpen, toggleOpen, onChangeAsset } = props
  const account = useCurrentAccount()
  const markets = useMarkets()
  const { data: prices } = usePrices()
  const marketEnabledAssets = useMarketEnabledAssets()
  const balances = useMemo(() => {
    if (!account) return []
    return getMergedBalancesForAsset(account, marketEnabledAssets)
  }, [account, marketEnabledAssets])

  const sortedAssets = useMemo(
    () => sortAssetsOrPairs(assets, prices, markets, balances, baseDenom) as Asset[],
    [assets, prices, markets, balances, baseDenom],
  )

  return (
    <section>
      {type !== 'perps' && (
        <button
          className='flex items-center justify-between w-full p-4 bg-black/20'
          onClick={toggleOpen}
        >
          <Text>{type === 'buy' ? 'Buy asset' : 'Sell asset'}</Text>
          <ChevronDown className={classNames(isOpen && '-rotate-180', 'w-4')} />
        </button>
      )}
      {isOpen &&
        (sortedAssets.length === 0 ? (
          <Text size='xs' className='p-4'>
            No available assets found
          </Text>
        ) : (
          <ul>
            {sortedAssets.map((asset) => (
              <AssetSelectorItem
                balances={balances}
                key={`${type}-${asset.symbol}`}
                onSelect={props.onChangeAsset}
                depositCap={type === 'buy' ? markets?.find(byDenom(asset.denom))?.cap : undefined}
                asset={asset}
              />
            ))}
          </ul>
        ))}
    </section>
  )
}
