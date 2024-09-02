import { useCallback, useMemo, useState } from 'react'

import SearchBar from 'components/common/SearchBar'
import Text from 'components/common/Text'
import AssetsSelect from 'components/Modals/AssetsSelect'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'

interface Props {
  farm: Vault | AstroLp
  defaultSelectedDenoms: string[]
  onChangeBorrowDenoms: (denoms: string[]) => void
}

export default function AddFarmAssetsModalContent(props: Props) {
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

  const [farmAssets, borrowEnabled] = useMemo(
    () =>
      filteredMarkets.reduce(
        (acc, market) => {
          if (!market.asset.isBorrowEnabled) return acc

          if (
            market.asset.denom === props.farm.denoms.primary ||
            market.asset.denom === props.farm.denoms.secondary
          ) {
            acc[0].push(market.asset)
          } else if (market.asset.isBorrowEnabled) {
            acc[1].push(market.asset)
          }
          return acc
        },
        [[], []] as [Asset[], Asset[]],
      ),
    [filteredMarkets, props.farm.denoms.primary, props.farm.denoms.secondary],
  )

  const selectedDenoms = useStore((s) => s.addFarmBorrowingsModal?.selectedDenoms)
  const [selectedPoolDenoms, setSelectedPoolDenoms] = useState<string[]>(
    selectedDenoms?.filter((denom) => farmAssets.map((asset) => asset.denom).includes(denom)) || [],
  )
  const [selectedOtherDenoms, setSelectedOtherDenoms] = useState<string[]>(
    selectedDenoms?.filter((denom) => borrowEnabled.map((asset) => asset.denom).includes(denom)) ||
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
          placeholder={`Search for e.g. "ATOM" or "Cosmos"`}
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
          assets={farmAssets}
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
          assets={borrowEnabled}
          onChangeSelected={onChangeOtherDenoms}
          selectedDenoms={selectedOtherDenoms}
          isBorrow
        />
      </div>
    </>
  )
}
