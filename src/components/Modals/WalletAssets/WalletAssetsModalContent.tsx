import { useCallback, useMemo, useState } from 'react'

import AssetsSelect from 'components/Modals/AssetsSelect'
import { CircularProgress } from 'components/common/CircularProgress'
import SearchBar from 'components/common/SearchBar'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { handleUnknownAsset } from 'utils/assets'

interface Props {
  onChangeDenoms: (denoms: string[]) => void
}

export default function WalletAssetsModalContent(props: Props) {
  const { onChangeDenoms } = props
  const [searchString, setSearchString] = useState<string>('')
  const balances = useStore((s) => s.balances)
  const { data: allChainAssets, isLoading } = useAssets()
  const chainConfig = useChainConfig()
  const enableAnyAsset = chainConfig.anyAsset

  const assetsInWallet = useMemo(() => {
    if (isLoading) return []
    const knownAssetsInWallet: Asset[] = []
    const unknownAssetsInWallet: Asset[] = []
    balances.forEach((coin) => {
      const asset = allChainAssets.find(byDenom(coin.denom))
      if (asset) knownAssetsInWallet.push(asset)
      if (!asset && enableAnyAsset) unknownAssetsInWallet.push(handleUnknownAsset(coin))
    })

    return [...knownAssetsInWallet, ...unknownAssetsInWallet]
  }, [allChainAssets, balances, isLoading, enableAnyAsset])

  const filteredAssets: Asset[] = useMemo(() => {
    return assetsInWallet.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.denom.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchString.toLowerCase()),
    )
  }, [assetsInWallet, searchString])

  const currentSelectedDenom = useStore((s) => s.walletAssetsModal?.selectedDenoms ?? [])
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>(
    currentSelectedDenom.filter((denom) => filteredAssets.findIndex(byDenom(denom)) || []),
  )

  const onChangeSelect = useCallback(
    (denoms: string[]) => {
      setSelectedDenoms(denoms)
      onChangeDenoms(denoms)
    },
    [onChangeDenoms],
  )

  return (
    <>
      <div className='px-4 py-3 border-b border-white/5 bg-white/10'>
        <SearchBar
          value={searchString}
          placeholder={`Search for e.g. "ETH" or "Ethereum"`}
          onChange={setSearchString}
        />
      </div>
      <div className='h-full md:max-h-[446px] overflow-y-scroll scrollbar-hide'>
        {isLoading ? (
          <div className='flex justify-center w-full p-8'>
            <CircularProgress size={40} />
          </div>
        ) : (
          <AssetsSelect
            assets={filteredAssets}
            onChangeSelected={onChangeSelect}
            selectedDenoms={selectedDenoms}
          />
        )}
      </div>
    </>
  )
}
