import { cacheFn, stakingAprCache } from '../cache'

export default async function getStakingAprs(url: string) {
  try {
    return cacheFn(() => fetchAprs(url), stakingAprCache, `stakingAprs`)
  } catch (error) {
    throw error
  }
}

interface StakingAprResponse {
  stats: StakingApr[]
}

async function fetchAprs(url: string): Promise<StakingApr[]> {
  const response = await fetch(url)
  const body = (await response.json()) as StakingAprResponse
  return body.stats
}
