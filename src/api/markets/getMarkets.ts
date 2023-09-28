import { allParamsCache, cacheFn, marketsCache, totalDepositCache } from 'api/cache'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'
import {
  AssetParamsBaseForAddr as AssetParams,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { byDenom } from 'utils/array'
import { getEnabledMarketAssets } from 'utils/assets'
import iterateContractQuery from 'utils/iterateContractQuery'
import { resolveMarketResponse } from 'utils/resolvers'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const redBankClient = await getRedBankQueryClient()
    const paramsClient = await getParamsQueryClient()

    const enabledAssets = getEnabledMarketAssets()
    const capQueries = enabledAssets.map((asset) =>
      cacheFn(
        () => paramsClient.totalDeposit({ denom: asset.denom }),
        totalDepositCache,
        asset.denom,
        60,
      ),
    )
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

    return enabledAssets.map((asset) =>
      resolveMarketResponse(
        markets.find(byDenom(asset.denom)) as RedBankMarket,
        assetParams.find(byDenom(asset.denom)) as AssetParams,
        assetCaps.find(byDenom(asset.denom)) as TotalDepositResponse,
      ),
    )
  } catch (ex) {
    throw ex
  }
}
