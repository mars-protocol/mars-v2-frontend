import { ENV } from 'constants/env'

const url = `${ENV.URL_REST}osmosis/gamm/v1beta1/pools/`
export default async function getPools(poolIds: string[]): Promise<Pool[]> {
  const promises = poolIds.map((poolId) => fetch(url + poolId))

  const responses = await Promise.all(promises)

  return await Promise.all(responses.map(async (pool) => (await pool.json()).pool as Pool))
}

interface Pool {
  '@type': string
  address: string
  future_pool_governor: string
  id: string
  pool_assets?: PoolAsset[]
  pool_liquidity?: PoolLiquidity[]
  pool_params: PoolParams
  total_shares: TotalShares
  total_weight: string
}

interface PoolAsset {
  token: TotalShares
  weight: string
}

interface PoolLiquidity {
  amount: string
  denom: string
}
interface TotalShares {
  amount: string
  denom: string
}

interface PoolParams {
  exit_fee: string
  smooth_weight_change_params: null
  swap_fee: string
}
