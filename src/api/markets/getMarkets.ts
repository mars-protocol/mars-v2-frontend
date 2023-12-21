import { allParamsCache, cacheFn, marketsCache, totalDepositCache } from 'api/cache'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'
import {
  AssetParamsBaseForAddr as AssetParams,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { byDenom } from 'utils/array'
import iterateContractQuery from 'utils/iterateContractQuery'
import { resolveMarketResponse } from 'utils/resolvers'

export default async function getMarkets(chainConfig: ChainConfig): Promise<Market[]> {
  try {
    const redBankClient = await getRedBankQueryClient(chainConfig)
    const paramsClient = await getParamsQueryClient(chainConfig)

    const marketAssets = chainConfig.assets.filter((asset) => asset.isMarket)

    const capQueries = marketAssets
      .filter((asset) => asset.isMarket)
      .map((asset) =>
        cacheFn(
          () => paramsClient.totalDeposit({ denom: asset.denom }),
          totalDepositCache,
          `enabledMarkets/${asset.denom}`,
          60,
        ),
      )

    const caps = await Promise.all(capQueries)

    const [markets, assetParams, assetCaps] = await Promise.all([
      cacheFn(() => iterateContractQuery(redBankClient.markets), marketsCache, 'markets', 60),
      cacheFn(
        async () => await iterateContractQuery(paramsClient.allAssetParams),
        allParamsCache,
        'params',
        60,
      ),
      Promise.all(capQueries),
    ])

    return marketAssets.map((asset) =>
      resolveMarketResponse(
        markets.find(byDenom(asset.denom)) as RedBankMarket,
        assetParams.find(byDenom(asset.denom)) as AssetParams,
        assetCaps.find(byDenom(asset.denom)) as TotalDepositResponse,
      ),
    )
  } catch (ex) {
    console.log(ex)
    throw ex
  }
}
