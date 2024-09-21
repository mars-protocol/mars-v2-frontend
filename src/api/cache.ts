import {
  ArrayOfCoin,
  Positions,
  VaultUtilizationResponse,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { ArrayOfActiveEmission } from 'types/generated/mars-incentives/MarsIncentives.types'
import { PriceResponse } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.types'
import {
  AssetParamsBaseForAddr,
  TotalDepositResponse,
  VaultConfigBaseForAddr,
} from 'types/generated/mars-params/MarsParams.types'
import { VaultPositionResponse } from 'types/generated/mars-perps/MarsPerps.types'
import {
  ArrayOfMarket,
  ArrayOfUserDebtResponse,
} from 'types/generated/mars-red-bank/MarsRedBank.types'

interface Cache<T> extends Map<string, { data: T | null; timestamp: number }> {}

let totalRequests = 0
let cachedRequests = 0

export async function cacheFn<T>(
  fn: () => Promise<T>,
  cache: Cache<T>,
  key: string,
  staleAfter = 5,
) {
  const cachedData = cache.get(key)?.data
  const isStale = (cache.get(key)?.timestamp || 0) + 1000 * staleAfter < new Date().getTime()

  totalRequests += 1

  if (cachedData && !isStale) {
    cachedRequests += 1
    return cachedData
  }

  const data = await fn()
  cache.set(key, { data, timestamp: new Date().getTime() })

  return data
}

export const positionsCache: Cache<Positions> = new Map()
export const aprsCacheResponse: Cache<Response> = new Map()
export const aprsCache: Cache<AprResponse> = new Map()
export const vaultConfigsCache: Cache<VaultConfigBaseForAddr[]> = new Map()
export const vaultUtilizationCache: Cache<VaultUtilizationResponse> = new Map()
export const unlockPositionsCache: Cache<VaultExtensionResponse> = new Map()
export const estimateWithdrawCache: Cache<Coin[]> = new Map()
export const previewRedeemCache: Cache<string> = new Map()
export const priceCache: Cache<BigNumber> = new Map()
export const pythPriceCache: Cache<PythConfidenceData> = new Map()
export const oraclePriceCache: Cache<PriceResponse[]> = new Map()
export const poolPriceCache: Cache<PriceResponse[]> = new Map()
export const emissionsCache: Cache<ArrayOfActiveEmission> = new Map()
export const marketCache: Cache<Market> = new Map()
export const marketsCache: Cache<ArrayOfMarket> = new Map()
export const underlyingLiquidityAmountCache: Cache<string> = new Map()
export const unclaimedRewardsCache: Cache<ArrayOfCoin> = new Map()
export const totalDepositCache: Cache<TotalDepositResponse> = new Map()
export const allParamsCache: Cache<AssetParamsBaseForAddr[]> = new Map()
export const underlyingDebtCache: Cache<string> = new Map()
export const previewDepositCache: Cache<{ vaultAddress: string; amount: string }> = new Map()
export const stakingAprCache: Cache<StakingApr[]> = new Map()
export const assetParamsCache: Cache<AssetParamsBaseForAddr[]> = new Map()
export const userDebtCache: Cache<ArrayOfUserDebtResponse> = new Map()
export const vaultPositionResponse: Cache<VaultPositionResponse | null> = new Map()
