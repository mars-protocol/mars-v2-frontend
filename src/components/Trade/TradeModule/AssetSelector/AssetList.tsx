import classNames from 'classnames'
import { useMemo } from 'react'

import { ChevronDown } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useMarketAssets from 'hooks/useMarketAssets'
import useMarketDeposits from 'hooks/useMarketDeposits'
import usePrices from 'hooks/usePrices'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getEnabledMarketAssets, sortAssetsOrPairs } from 'utils/assets'
import AssetSelectorItem from 'components/Trade/TradeModule/AssetSelector/AssetSelectorItem'

interface Props {
  type: 'buy' | 'sell'
  assets: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAsset: (asset: Asset | AssetPair) => void
}

const baseDenom = ASSETS[0].denom

export default function AssetList(props: Props) {
  const { assets, type, isOpen, toggleOpen, onChangeAsset } = props
  const account = useCurrentAccount()
  const { data: marketAssets } = useMarketAssets()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: prices } = usePrices()
  const balances = useMemo(() => {
    if (!account) return []
    return getMergedBalancesForAsset(account, getEnabledMarketAssets())
  }, [account])

  const sortedAssets = useMemo(
    () => sortAssetsOrPairs(assets, prices, marketDeposits, balances, baseDenom) as Asset[],
    [balances, prices, assets, marketDeposits],
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
                buyAsset={asset}
              />
            ))}
          </ul>
        ))}
    </section>
  )
}
