import { useCallback, useMemo, useState } from 'react'

import AssetSelectTable from 'components/Modals/AssetsSelect/AssetSelectTable'
import SearchBar from 'components/SearchBar'
import useStore from 'store'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  defaultSelectedDenoms: string[]
  onChangeDenoms: (denoms: string[]) => void
}

export default function WalletAssetsModalContent(props: Props) {
  const [searchString, setSearchString] = useState<string>('')
  const balances = useStore((s) => s.balances)

  const assets = useMemo(() => {
    const assetsInWallet: Asset[] = []
    balances.forEach((balance) => {
      const asset = getAssetByDenom(balance.denom)
      if (asset && asset.isMarket) assetsInWallet.push(asset)
    })

    return assetsInWallet
  }, [balances])

  const filteredAssets: Asset[] = useMemo(() => {
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.denom.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchString.toLowerCase()),
    )
  }, [assets, searchString])

  function onChangeSearchString(value: string) {
    setSearchString(value)
  }

  const [assetsList] = useMemo(
    () =>
      filteredAssets.reduce(
        (acc, asset) => {
          acc[0].push(asset)
          return acc
        },
        [[], []] as [Asset[], Asset[]],
      ),
    [filteredAssets],
  )

  const currentSelectedDenom = useStore((s) => s.walletAssetsModal?.selectedDenoms)
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>(
    currentSelectedDenom?.filter((denom) =>
      assetsList.map((asset) => asset.denom).includes(denom),
    ) || [],
  )

  const onChangeDenoms = useCallback(
    (denoms: string[]) => {
      setSelectedDenoms(denoms)
      props.onChangeDenoms([...denoms])
    },
    [props],
  )

  return (
    <>
      <div className='border-b border-white/5 bg-white/10 px-4 py-3'>
        <SearchBar
          value={searchString}
          placeholder={`Search for e.g. "ETH" or "Ethereum"`}
          onChange={onChangeSearchString}
        />
      </div>
      <div className='max-h-[446px] overflow-y-scroll scrollbar-hide'>
        <AssetSelectTable
          assets={assetsList}
          onChangeSelected={onChangeDenoms}
          selectedDenoms={selectedDenoms}
        />
      </div>
    </>
  )
}
