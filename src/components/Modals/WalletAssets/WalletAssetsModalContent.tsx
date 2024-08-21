import { useMemo, useState } from 'react'

import AssetsSelect from 'components/Modals/AssetsSelect'
import SearchBar from 'components/common/SearchBar'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { handleUnknownAsset } from 'utils/assets'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import { useSelectedDenoms } from 'hooks/assets/useSelectedDenoms'
import { useWeb3WalletConnection } from 'hooks/wallet/useWeb3WalletConnections'

interface Props {
  onChangeDenoms: (denoms: string[]) => void
}

export default function WalletAssetsModalContent(props: Props) {
  const { onChangeDenoms } = props
  const [searchString, setSearchString] = useState<string>('')
  const balances = useStore((s) => s.balances)
  const allChainAssets = useDepositEnabledAssets()
  const chainConfig = useChainConfig()
  const enableAnyAsset = chainConfig.anyAsset
  const { isConnected } = useWeb3WalletConnection()

  const assetsInWallet = useMemo(() => {
    const knownAssetsInWallet: Asset[] = []
    const unknownAssetsInWallet: Asset[] = []
    balances.forEach((coin) => {
      if (coin.amount === '0') return

      const asset = allChainAssets.find(byDenom(coin.denom))
      if (asset) {
        knownAssetsInWallet.push({
          ...asset,
          chainName: coin.chainName,
        })
      }
      if (!asset && enableAnyAsset) {
        const unknownAsset = handleUnknownAsset(coin)
        if (unknownAsset.symbol === 'SHARE') return
        unknownAssetsInWallet.push(unknownAsset)
      }
    })

    return [...knownAssetsInWallet, ...unknownAssetsInWallet]
  }, [allChainAssets, balances, enableAnyAsset])

  const filteredAssets: Asset[] = useMemo(() => {
    return assetsInWallet.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.denom.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
        asset?.chainName?.toLowerCase().includes(searchString.toLowerCase()),
    )
  }, [assetsInWallet, searchString])

  const { selectedDenoms, onChangeSelect } = useSelectedDenoms(
    filteredAssets,
    onChangeDenoms,
    isConnected,
  )

  const depositEnabledAssets = useDepositEnabledAssets()
  const whitelistedAssets = useWhitelistedAssets()

  const evmAssets = useMemo(
    () => filteredAssets.filter((asset) => asset.chainName),
    [filteredAssets],
  )

  const collateralAssets = useMemo(
    () =>
      whitelistedAssets.filter((asset) =>
        filteredAssets.some((filteredAsset) => filteredAsset.denom === asset.denom),
      ),
    [whitelistedAssets, filteredAssets],
  )

  const nonCollateralAssets = useMemo(
    () =>
      depositEnabledAssets.filter(
        (asset) =>
          !asset.isWhitelisted &&
          !asset.isPoolToken &&
          filteredAssets.some((filteredAsset) => filteredAsset.denom === asset.denom),
      ),
    [depositEnabledAssets, filteredAssets],
  )

  return (
    <>
      <div className='px-4 py-3 border-b border-white/5 bg-white/10'>
        <SearchBar
          value={searchString}
          placeholder={`Search for e.g. "ATOM" or "Cosmos"`}
          onChange={setSearchString}
        />
      </div>
      <div className='h-full md:max-h-[446px] overflow-y-scroll scrollbar-hide'>
        <AssetsSelect
          assets={[...collateralAssets, ...evmAssets]}
          onChangeSelected={onChangeSelect}
          selectedDenoms={selectedDenoms}
          nonCollateralTableAssets={nonCollateralAssets}
        />
      </div>
    </>
  )
}
