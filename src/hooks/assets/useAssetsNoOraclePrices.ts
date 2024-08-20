import getDexAssets from 'api/assets/getDexAssets'
import getDexPools from 'api/assets/getDexPools'
import USD from 'constants/USDollar'
import { ORACLE_DENOM } from 'constants/oracle'
import { PRICE_STALE_TIME } from 'constants/query'
import useCampaignApys from 'hooks/campaign/useCampaignApys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAssetParams from 'hooks/params/useAssetParams'
import useStore from 'store'
import useSWR from 'swr'
import { BNCoin } from 'types/classes/BNCoin'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import { byDenom } from 'utils/array'
import { resolveAssetCampaign } from 'utils/assets'
import { BN } from 'utils/helpers'
import { calculatePoolWeight } from 'utils/pools'

export default function useAssetsNoOraclePrices() {
  const chainConfig = useChainConfig()
  const { data: assetParams } = useAssetParams()
  const { data: campaignApys } = useCampaignApys()
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
    async () => fetchSortAndMapAllAssets(chainConfig, assetParams, campaignApys),
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
  campaignApys: AssetCampaignApy[],
  /* PERPS
  perpsParams: PerpParams[], 
  */
) {
  const [assets, pools] = await Promise.all([getDexAssets(chainConfig), getDexPools(chainConfig)])
  const poolAssets: Asset[] = pools.map((pool) => {
    return {
      denom: pool.lpAddress,
      name: `${pool.assets[0].symbol}-${pool.assets[1].symbol} LP`,
      decimals: 6,
      symbol: `${pool.assets[0].symbol}-${pool.assets[1].symbol}`,
      price: BNCoin.fromDenomAndBigNumber(
        ORACLE_DENOM,
        BN(pool.totalLiquidityUSD).dividedBy(BN(pool.poolTotalShare).shiftedBy(-6)),
      ),
    }
  })

  const allAssets = chainConfig.lp
    ? [...assets, ...poolAssets, USD, ...chainConfig.lp]
    : [...assets, ...poolAssets, USD]

  const unsortedAssets = allAssets.map((asset) => {
    const currentAssetParams = assetParams.find(byDenom(asset.denom))
    const currentAssetPoolParams = pools.find((pool) => pool.lpAddress === asset.denom)

    const deprecatedAssets = chainConfig.deprecated ?? []
    let currentAssetPoolInfo: PoolInfo | undefined

    if (currentAssetPoolParams) {
      const primaryAsset = assets.find(byDenom(currentAssetPoolParams.assets[0].denom))
      const secondaryAsset = assets.find(byDenom(currentAssetPoolParams.assets[1].denom))
      const symbol = `${primaryAsset?.symbol ?? currentAssetPoolParams.assets[0].symbol}-${secondaryAsset?.symbol ?? currentAssetPoolParams.assets[1].symbol}`
      const primaryAssetAmount = currentAssetPoolParams.assets[0].amount ?? 0
      const secondaryAssetAmount = currentAssetPoolParams.assets[1].amount ?? 0
      currentAssetPoolInfo = {
        address: currentAssetPoolParams.poolAddress,
        type: currentAssetPoolParams.poolType,
        assets: {
          primary: primaryAsset ?? {
            denom: currentAssetPoolParams.assets[0].denom,
            name: currentAssetPoolParams.assets[0].symbol,
            decimals: currentAssetPoolParams.assets[0].decimals,
            symbol: currentAssetPoolParams.assets[0].symbol,
          },
          secondary: secondaryAsset ?? {
            denom: currentAssetPoolParams.assets[1].denom,
            name: currentAssetPoolParams.assets[1].symbol,
            decimals: currentAssetPoolParams.assets[1].decimals,
            symbol: currentAssetPoolParams.assets[1].symbol,
          },
        },
        assetsPerShare: {
          primary: BN(primaryAssetAmount).dividedBy(currentAssetPoolParams.poolTotalShare),
          secondary: BN(secondaryAssetAmount).dividedBy(currentAssetPoolParams.poolTotalShare),
        },
        rewards: currentAssetPoolParams.rewards,
        yield: currentAssetPoolParams.yield,
        weight: calculatePoolWeight(
          currentAssetPoolParams.assets[0],
          currentAssetPoolParams.assets[1],
        ),
      }
      asset.symbol = symbol
      asset.name = `${symbol} LP`
    }

    /* PERPS
    const currentAssetPerpsParams = perpsParams ? perpsParams.find(byDenom(asset.denom)) : undefined 
    */

    const isDeprecated = deprecatedAssets.includes(asset.denom)
    const isAnyAssetAndNoPool = chainConfig.anyAsset && !currentAssetPoolInfo
    const isDepositEnabled = isDeprecated ? false : currentAssetParams?.red_bank.deposit_enabled
    const isTradeEnabled = isDeprecated
      ? true
      : asset.denom !== 'usd' &&
        !currentAssetPoolInfo &&
        (currentAssetParams?.red_bank.deposit_enabled || !currentAssetParams)

    return {
      ...asset,
      isPoolToken: !!currentAssetPoolInfo,
      isWhitelisted:
        currentAssetParams && currentAssetParams.credit_manager.whitelisted && !isDeprecated,
      isAutoLendEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isBorrowEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isDepositEnabled: isAnyAssetAndNoPool ? true : isDepositEnabled,
      isDisplayCurrency: currentAssetParams?.red_bank.borrow_enabled || asset.denom === 'usd',
      isStable: chainConfig.stables.includes(asset.denom),
      isStaking:
        !!currentAssetParams?.credit_manager.hls && !currentAssetParams?.red_bank.borrow_enabled,
      /* PERPS
      isPerpsEnabled: !!currentAssetPerpsParams,
      */
      isDeprecated,
      isTradeEnabled,
      poolInfo: currentAssetPoolInfo,
      campaign: resolveAssetCampaign(asset, campaignApys, chainConfig),
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
