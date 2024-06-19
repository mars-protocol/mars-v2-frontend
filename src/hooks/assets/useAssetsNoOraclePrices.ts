import getDexAssets from 'api/assets/getDexAssets'
import USD from 'constants/USDollar'
import { PRICE_STALE_TIME } from 'constants/query'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAssetParams from 'hooks/params/useAssetParams'
import useStore from 'store'
import useSWR from 'swr'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import { byDenom } from 'utils/array'

export default function useAssetsNoOraclePrices() {
  const chainConfig = useChainConfig()
  const { data: assetParams } = useAssetParams()
  /* PERPS
  const { data: perpsParams } = useAllPerpsParamsSC()
  const fetchedPerpsParams = chainConfig.perps ? perpsParams : ([] as PerpParams[])
  */

  return useSWR(
    /* PERPS
    assetParams && fetchedPerpsParams && `chains/${chainConfig.id}/noOraclePrices`,
    async () => fetchSortAndMapAllAssets(chainConfig, assetParams, fetchedPerpsParams),
    */

    assetParams && `chains/${chainConfig.id}/noOraclePrices`,
    async () => fetchSortAndMapAllAssets(chainConfig, assetParams),
    {
      suspense: true,
      revalidateOnFocus: false,
      staleTime: PRICE_STALE_TIME,
      revalidateIfStale: true,
    },
  )
}

async function fetchSortAndMapAllAssets(
  chainConfig: ChainConfig,
  assetParams: AssetParamsBaseForAddr[],
  /* PERPS
  perpsParams: PerpParams[], 
  */
) {
  const assets = await getDexAssets(chainConfig)
  const allAssets = chainConfig.lp ? [...assets, USD, ...chainConfig.lp] : [...assets, USD]

  const unsortedAssets = allAssets.map((asset) => {
    const currentAssetParams = assetParams.find(byDenom(asset.denom))

    /* PERPS
    const currentAssetPerpsParams = perpsParams ? perpsParams.find(byDenom(asset.denom)) : undefined 
    */

    return {
      ...asset,
      isWhitelisted: !!currentAssetParams,
      isAutoLendEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isBorrowEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isDepositEnabled: currentAssetParams?.red_bank.deposit_enabled ?? false,
      isDisplayCurrency: currentAssetParams?.red_bank.borrow_enabled || asset.denom === 'usd',
      isStable: chainConfig.stables.includes(asset.denom),
      isStaking:
        !!currentAssetParams?.credit_manager.hls && !currentAssetParams?.red_bank.borrow_enabled,
      /* PERPS
      isPerpsEnabled: !!currentAssetPerpsParams,
      */
      isTradeEnabled:
        asset.denom !== 'usd' &&
        !asset.isPoolToken &&
        (currentAssetParams?.red_bank.deposit_enabled || !currentAssetParams),
    }
  })

  // Sort Assets to list assets with asset params (listed assets) first
  const sortedAssets = unsortedAssets.sort((a, b) => {
    if (a.isWhitelisted && !b.isWhitelisted) return -1
    if (!a.isWhitelisted && b.isWhitelisted) return 1
    if (a.logo && !b.logo) return -1
    if (!a.logo && b.logo) return 1
    if (a.denom === chainConfig.defaultCurrency.coinMinimalDenom) return -1
    if (b.denom === chainConfig.defaultCurrency.coinMinimalDenom) return 1
    return a.symbol.localeCompare(b.symbol)
  })

  // We need to set the assets to the store to use them in the broadcast slice
  useStore.setState({ assets: sortedAssets })
  if (!chainConfig.anyAsset)
    return sortedAssets.filter((asset) => asset.isWhitelisted || asset.denom === 'usd')

  return sortedAssets
}
