import useSWR from 'swr'

import useTradeEnabledAssets from 'assets/useTradeEnabledAssets'
import useChainConfig from 'chain/useChainConfig'
import useAssetParams from 'params/useAssetParams'
import {
  AssetParamsBaseForAddr as AssetParams,
  TotalDepositResponse,
} from 'types/generated/mars-params/MarsParams.types'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'
import { byDenom } from 'utils/array'
import { resolveMarketResponse } from 'utils/resolvers'
import useMarketDepositCaps from './useMarketDepositCaps'
import useMarketsInfo from './useMarketsInfo'

export default function useMarkets() {
  const chainConfig = useChainConfig()
  const { data: marketInfos } = useMarketsInfo()
  const { data: marketDepositCaps } = useMarketDepositCaps()
  const { data: assetParams } = useAssetParams()
  const assets = useTradeEnabledAssets()

  const result = useSWR(
    !!marketInfos?.length &&
      !!marketDepositCaps?.length &&
      !!assetParams.length &&
      `chains/${chainConfig.id}/markets`,
    () => {
      return assets.map((asset) =>
        resolveMarketResponse(
          asset,
          marketInfos!.find(byDenom(asset.denom)) as RedBankMarket & Partial<Market>,
          assetParams.find(byDenom(asset.denom)) as AssetParams,
          marketDepositCaps!.find(byDenom(asset.denom)) as TotalDepositResponse,
        ),
      )
    },
    {
      fallbackData: [],
    },
  )

  return result.data
}
