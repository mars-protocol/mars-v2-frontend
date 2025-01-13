import getDexAssets from 'api/assets/getDexAssets'
import getDexPools from 'api/assets/getDexPools'
import USD from 'constants/USDollar'
import { ORACLE_DENOM } from 'constants/oracle'
import useCampaignApys from 'hooks/campaign/useCampaignApys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAssetParams from 'hooks/params/useAssetParams'
import { useAllPerpsParamsSC } from 'hooks/perps/usePerpsParams'
import useSWRImmutable from 'swr/immutable'
import { BNCoin } from 'types/classes/BNCoin'
import { AssetParamsBaseForAddr, PerpParams } from 'types/generated/mars-params/MarsParams.types'
import { byDenom } from 'utils/array'
import { resolveAssetCampaigns } from 'utils/assets'
import { BN } from 'utils/helpers'
import { calculatePoolWeight } from 'utils/pools'

export default function useAssetsNoOraclePrices() {
  const chainConfig = useChainConfig()
  const { data: assetParams } = useAssetParams()
  const { data: campaignApys } = useCampaignApys()
  const { data: perpsParams } = useAllPerpsParamsSC()
  const fetchedPerpsParams = chainConfig.perps ? perpsParams : ([] as PerpParams[])

  return useSWRImmutable(
    assetParams && fetchedPerpsParams && `chains/${chainConfig.id}/noOraclePrices`,
    async () =>
      fetchSortAndMapAllAssets(chainConfig, assetParams, campaignApys, fetchedPerpsParams),
    {
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}

async function fetchSortAndMapAllAssets(
  chainConfig: ChainConfig,
  assetParams: AssetParamsBaseForAddr[],
  campaignApys: AssetCampaignApy[],
  perpsParams: PerpParams[],
) {
  const [assets, pools] = await Promise.all([getDexAssets(chainConfig), getDexPools(chainConfig)])
  const poolTokensIndexesInAssets: number[] = []
  const poolAssets: Asset[] = pools.map((pool) => {
    const indexOfPoolInAssets = assets.findIndex(byDenom(pool.lpAddress))
    if (indexOfPoolInAssets >= 0) poolTokensIndexesInAssets.push(indexOfPoolInAssets)
    return {
      denom: pool.lpAddress,
      name: `${pool.assets[0].symbol}-${pool.assets[1].symbol} LP`,
      decimals: 6,
      symbol: `${pool.assets[0].symbol}-${pool.assets[1].symbol}`,
      price: BNCoin.fromDenomAndBigNumber(
        ORACLE_DENOM,
        BN(pool.totalLiquidityUSD).dividedBy(BN(pool.poolTotalShare).shiftedBy(-6)),
      ),
      campaigns: [],
    }
  })

  poolTokensIndexesInAssets.map((i) => assets.splice(i, 1))

  const allAssets = chainConfig.lp
    ? [...assets, ...poolAssets, USD, ...chainConfig.lp]
    : [...assets, ...poolAssets, USD]

  const uniqueAssets = allAssets.filter(
    (asset, index, self) => index === self.findIndex((t) => t.denom === asset.denom),
  )
  const unsortedAssets = uniqueAssets.map((asset) => {
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
            campaigns: [],
          },
          secondary: secondaryAsset ?? {
            denom: currentAssetPoolParams.assets[1].denom,
            name: currentAssetPoolParams.assets[1].symbol,
            decimals: currentAssetPoolParams.assets[1].decimals,
            symbol: currentAssetPoolParams.assets[1].symbol,
            campaigns: [],
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

    const currentAssetPerpsParams = perpsParams ? perpsParams.find(byDenom(asset.denom)) : undefined

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
        currentAssetParams && (currentAssetParams.credit_manager.whitelisted || isDeprecated),
      isAutoLendEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isBorrowEnabled: currentAssetParams?.red_bank.borrow_enabled ?? false,
      isDepositEnabled: isAnyAssetAndNoPool ? true : isDepositEnabled,
      isDisplayCurrency: currentAssetParams?.red_bank.borrow_enabled || asset.denom === 'usd',
      isStable: chainConfig.stables.includes(asset.denom),
      isStaking:
        !!currentAssetParams?.credit_manager.hls && !currentAssetParams?.red_bank.borrow_enabled,
      isPerpsEnabled: !!currentAssetPerpsParams,
      isDeprecated,
      isTradeEnabled,
      poolInfo: currentAssetPoolInfo,
      campaigns: resolveAssetCampaigns(asset, campaignApys, chainConfig),
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

  if (!chainConfig.anyAsset)
    return sortedAssets.filter((asset) => asset.isWhitelisted || asset.denom === 'usd')

  return sortedAssets
}
