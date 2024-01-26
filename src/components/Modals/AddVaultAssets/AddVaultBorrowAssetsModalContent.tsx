import { useCallback, useMemo, useState } from 'react'

import SearchBar from 'components/common/SearchBar'
import Text from 'components/common/Text'
import AssetsSelect from 'components/Modals/AssetsSelect'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'

interface Props {
  vault: Vault
  defaultSelectedDenoms: string[]
  onChangeBorrowDenoms: (denoms: string[]) => void
}

export default function AddVaultAssetsModalContent(props: Props) {
  const [searchString, setSearchString] = useState<string>('')
  const markets = useMarkets()

  const filteredMarkets: Market[] = useMemo(() => {
    return markets.filter(
      (market) =>
        market.asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
        market.asset.denom.toLowerCase().includes(searchString.toLowerCase()) ||
        market.asset.symbol.toLowerCase().includes(searchString.toLowerCase()),
    )
  }, [markets, searchString])

  function onChangeSearchString(value: string) {
    setSearchString(value)
  }

  const [poolAssets, stableAssets] = useMemo(
    () =>
      filteredMarkets.reduce(
        (acc, market) => {
          if (
            market.asset.denom === props.vault.denoms.primary ||
            market.asset.denom === props.vault.denoms.secondary
          ) {
            acc[0].push(market.asset)
          } else if (market.asset.isStable) {
            acc[1].push(market.asset)
          }
          return acc
        },
        [[], []] as [Asset[], Asset[]],
      ),
    [filteredMarkets, props.vault.denoms.primary, props.vault.denoms.secondary],
  )

  const selectedDenoms = useStore((s) => s.addVaultBorrowingsModal?.selectedDenoms)
  const [selectedPoolDenoms, setSelectedPoolDenoms] = useState<string[]>(
    selectedDenoms?.filter((denom) => poolAssets.map((asset) => asset.denom).includes(denom)) || [],
  )
  const [selectedOtherDenoms, setSelectedOtherDenoms] = useState<string[]>(
    selectedDenoms?.filter((denom) => stableAssets.map((asset) => asset.denom).includes(denom)) ||
      [],
  )

  const onChangePoolDenoms = useCallback(
    (denoms: string[]) => {
      setSelectedPoolDenoms(denoms)
      props.onChangeBorrowDenoms([...denoms, ...selectedOtherDenoms])
    },
    [props, selectedOtherDenoms],
  )

  const onChangeOtherDenoms = useCallback(
    (denoms: string[]) => {
      setSelectedOtherDenoms(denoms)
      props.onChangeBorrowDenoms([...selectedPoolDenoms, ...denoms])
    },
    [props, selectedPoolDenoms],
  )

  return (
    <>
      <div className='px-4 py-3 border-b border-white/5 bg-white/10'>
        <SearchBar
          value={searchString}
          placeholder={`Search for e.g. "ETH" or "Ethereum"`}
          onChange={onChangeSearchString}
        />
      </div>
      <div className='h-[446px] overflow-y-scroll scrollbar-hide'>
        <div className='p-4'>
          <Text>Available Assets</Text>
          <Text size='xs' className='mt-1 text-white/60'>
            Leverage will be set at 50% for both assets by default
          </Text>
        </div>
        <AssetsSelect
          assets={poolAssets}
          onChangeSelected={onChangePoolDenoms}
          selectedDenoms={selectedPoolDenoms}
          isBorrow
        />
        <div className='p-4'>
          <Text>Assets not in the liquidity pool</Text>
          <Text size='xs' className='mt-1 text-white/60'>
            These are swapped for an asset within the pool. Toggle Custom Ratio in order to select
            these assets below.
          </Text>
        </div>
        <AssetsSelect
          assets={stableAssets}
          onChangeSelected={onChangeOtherDenoms}
          selectedDenoms={selectedOtherDenoms}
          isBorrow
        />
      </div>
    </>
  )
}
