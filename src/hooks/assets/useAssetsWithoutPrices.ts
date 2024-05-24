import USD from 'configs/assets/USDollar'
import useAstroportAssets from 'hooks/assets/useAstroportAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAssetParams from 'hooks/params/useAssetParams'
import { useAllPerpsParamsSC } from 'hooks/perps/usePerpsParams'
import useStore from 'store'
import useSWR from 'swr'
import { AssetParamsBaseForAddr, PerpParams } from 'types/generated/mars-params/MarsParams.types'

export default function useAssetsWithoutPrices() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAstroportAssets()
  const { data: assetParams } = useAssetParams()
  const { data: perpsParams } = useAllPerpsParamsSC()

  return useSWR(
    assets && assetParams && `chains/${chainConfig.id}/allAssets`,
    () => sortAndMapAllAssets(chainConfig, assets!, assetParams!, perpsParams),
    {
      suspense: true,
      revalidateOnFocus: false,
      staleTime: 30_000,
      revalidateIfStale: true,
    },
  )
}

function sortAndMapAllAssets(
  chainConfig: ChainConfig,
  assets: Asset[],
  assetParams: AssetParamsBaseForAddr[],
  perpsParams?: PerpParams[],
) {
  const allAssets = chainConfig.lp ? [...assets, USD, ...chainConfig.lp] : [...assets, USD]

  const unsortedAssets = allAssets.map((asset) => {
    const currentAssetParams = assetParams.find((ap) => ap.denom === asset.denom)
    const currentAssetPerpsParams = perpsParams
      ? perpsParams.find((pp) => pp.denom === asset.denom)
      : undefined

    return {
      ...asset,
      hasAssetParams: !!currentAssetParams,
      isAutoLendEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isBorrowEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isDepositEnabled: currentAssetParams?.red_bank.deposit_enabled ?? false,
      isDisplayCurrency: currentAssetParams?.red_bank.borrow_enabled || asset.denom === 'usd',
      isStable: chainConfig.stables.includes(asset.denom),
      isStaking:
        !!currentAssetParams?.credit_manager.hls && !currentAssetParams?.red_bank.borrow_enabled,
      isPerpsEnabled: !!currentAssetPerpsParams,
      isTradeEnabled:
        asset.denom !== 'usd' &&
        (currentAssetParams?.red_bank.deposit_enabled || !currentAssetParams),
    }
  })

  // Sort Assets to list assets with asset params (listed assets) first
  const sortedAssets = unsortedAssets.sort((a, b) => {
    if (a.hasAssetParams && !b.hasAssetParams) return -1
    if (!a.hasAssetParams && b.hasAssetParams) return 1
    return a.symbol.localeCompare(b.symbol)
  })

  // We need to set the assets to the store to use them in the broadcast slice
  useStore.setState({ assets: sortedAssets })
  if (!chainConfig.anyAsset)
    return sortedAssets.filter((asset) => asset.hasAssetParams || asset.denom === 'usd')

  return sortedAssets
}
