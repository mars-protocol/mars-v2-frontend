import { BN_ZERO } from 'constants/math'
import { STANDARD_SWAP_FEE } from 'utils/constants'

export default async function getOsmosisSwapFee(
  chainConfig: ChainConfig,
  poolIds: string[],
): Promise<number> {
  const uri = chainConfig.endpoints.pools
  if (!uri) return STANDARD_SWAP_FEE

  const promises = poolIds.map((poolId) => fetch(uri.replace('POOL_ID', poolId)))

  const responses = await Promise.all(promises)

  const pools = await Promise.all(responses.map(async (pool) => (await pool.json()).pool as Pool))

  if (!pools?.length) return STANDARD_SWAP_FEE

  return pools
    .reduce((acc, pool) => acc.plus(pool?.pool_params?.swap_fee || STANDARD_SWAP_FEE), BN_ZERO)
    .toNumber()
}
