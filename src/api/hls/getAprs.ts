import { cacheFn, stakingAprCache } from 'api/cache'
import { ENV } from 'constants/env'

export default async function getStakingAprs() {
  try {
    return cacheFn(() => fetchAprs(), stakingAprCache, `stakingAprs`)
  } catch (error) {
    throw error
  }
}

interface StakingAprResponse {
  stats: StakingApr[]
}

async function fetchAprs(): Promise<StakingApr[]> {
  const url = ENV.STRIDE_APRS

  const response = await fetch(url)
  const body = (await response.json()) as StakingAprResponse
  return body.stats
}
