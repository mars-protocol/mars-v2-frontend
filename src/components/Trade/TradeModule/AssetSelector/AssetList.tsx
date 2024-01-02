import classNames from 'classnames'
import { useMemo } from 'react'

import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import AssetSelectorItem from 'components/Trade/TradeModule/AssetSelector/AssetSelectorItem'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useMarketAssets from 'hooks/markets/useMarketAssets'
import useMarketDeposits from 'hooks/markets/useMarketDeposits'
import useCurrentAccount from 'hooks/useCurrentAccount'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { sortAssetsOrPairs } from 'utils/assets'

interface Props {
  type: 'buy' | 'sell'
  assets: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAsset: (asset: Asset | AssetPair) => void
}

export default function AssetList(props: Props) {
  const baseDenom = useStore((s) => s.chainConfig.assets[0].denom)
  const { assets, type, isOpen, toggleOpen, onChangeAsset } = props
  const account = useCurrentAccount()
  const { data: marketAssets } = useMarketAssets()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: prices } = usePrices()
  const marketEnabledAssets = useMarketEnabledAssets()
  const balances = useMemo(() => {
    if (!account) return []
    return getMergedBalancesForAsset(account, marketEnabledAssets)
  }, [account, marketEnabledAssets])

  const sortedAssets = useMemo(
    () => sortAssetsOrPairs(assets, prices, marketDeposits, balances, baseDenom) as Asset[],
    [assets, prices, marketDeposits, balances, baseDenom],
  )

  return (
    <section>
      <button
        className='flex items-center justify-between w-full p-4 bg-black/20'
        onClick={toggleOpen}
      >
        <Text>{type === 'buy' ? 'Buy asset' : 'Sell asset'}</Text>
        <ChevronDown className={classNames(isOpen && '-rotate-180', 'w-4')} />
      </button>
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
                depositCap={
                  type === 'buy' ? marketAssets?.find(byDenom(asset.denom))?.cap : undefined
                }
                asset={asset}
              />
            ))}
          </ul>
        ))}
    </section>
  )
}
