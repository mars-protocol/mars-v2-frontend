import { useCallback, useMemo, useState } from 'react'

import AssetsSelect from 'components/Modals/AssetsSelect'
import SearchBar from 'components/common/SearchBar'
import useAllAssets from 'hooks/assets/useAllAssets'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  onChangeDenoms: (denoms: string[]) => void
}

export default function WalletAssetsModalContent(props: Props) {
  const { onChangeDenoms } = props
  const [searchString, setSearchString] = useState<string>('')
  const balances = useStore((s) => s.balances)
  const assets = useAllAssets()

  const assetsInWallet = useMemo(() => {
    const assetsInWalletInWallet: Asset[] = []
    balances.forEach((balance) => {
      const asset = assets.find(byDenom(balance.denom))
      if (asset && asset.isMarket) assetsInWalletInWallet.push(asset)
    })

    return assetsInWalletInWallet
  }, [assets, balances])

  const filteredAssets: Asset[] = useMemo(() => {
    return assetsInWallet.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.denom.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchString.toLowerCase()),
    )
  }, [assetsInWallet, searchString])

  const isBorrow = useStore((s) => s.walletAssetsModal?.isBorrow ?? false)
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
        <AssetsSelect
          assets={filteredAssets}
          onChangeSelected={onChangeSelect}
          selectedDenoms={selectedDenoms}
        />
      </div>
    </>
  )
}
