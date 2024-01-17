import { BN_ZERO } from 'constants/math'
import { STANDARD_SWAP_FEE } from 'utils/constants'

export default async function getOsmosisSwapFee(
  chainConfig: ChainConfig,
  poolIds: string[],
): Promise<number> {
  const promises = poolIds.map((poolId) =>
    fetch(chainConfig.endpoints.pools.replace('POOL_ID', poolId)),
  )

  const responses = await Promise.all(promises)

  const pools = await Promise.all(responses.map(async (pool) => (await pool.json()).pool as Pool))

  if (!pools?.length) return STANDARD_SWAP_FEE

  return pools
    .reduce((acc, pool) => acc.plus(pool?.pool_params?.swap_fee || STANDARD_SWAP_FEE), BN_ZERO)
    .toNumber()
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
