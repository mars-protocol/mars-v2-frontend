import useSWR from 'swr'

import { BNCoin } from '../../types/classes/BNCoin'
import {
  PaginationResponseForStakedLpPositionResponse,
  StakedLpPositionResponse,
} from '../../types/generated/mars-incentives/MarsIncentives.types'
import useAccountId from '../accounts/useAccountId'
import useChainConfig from '../chain/useChainConfig'
import useClients from '../chain/useClients'

function isPaginatedResponse(
  rewards: StakedLpPositionResponse | PaginationResponseForStakedLpPositionResponse,
): rewards is PaginationResponseForStakedLpPositionResponse {
  return (<PaginationResponseForStakedLpPositionResponse>rewards).data !== undefined
}

export default function useStakedAstroLpRewards(lpDenom?: string) {
  const accountId = useAccountId()
  const chainConfig = useChainConfig()
  const clients = useClients()

  const enabled = !!clients && !!accountId && !chainConfig.isOsmosis
  const key = lpDenom
    ? `chains/${chainConfig.id}/accounts/${accountId}/staked-astro-lp-rewards/${lpDenom}`
    : `chains/${chainConfig.id}/accounts/${accountId}/staked-astro-lp-rewards`

  return useSWR(enabled && key, () => getStakedAstroLpRewards(clients!, accountId!, lpDenom), {
    fallbackData: [] as StakedAstroLpRewards[],
    isPaused: () => !enabled,
    revalidateOnFocus: false,
    refreshInterval: 30_0000,
  })
}

async function getStakedAstroLpRewards(
  clients: ContractClients,
  accountId: string,
  lpDenom?: string,
): Promise<StakedAstroLpRewards[]> {
  try {
    const stakedAstroLpRewardsData = lpDenom
      ? await clients.incentives.stakedAstroLpPosition({
          accountId: accountId,
          lpDenom: lpDenom,
        })
      : await clients.incentives.stakedAstroLpPositions({
          accountId: accountId,
        })

    const stakedAstroLpRewards: StakedLpPositionResponse[] = []
    if (isPaginatedResponse(stakedAstroLpRewardsData)) {
      stakedAstroLpRewards.push(...stakedAstroLpRewardsData.data)
    } else {
      stakedAstroLpRewards.push(stakedAstroLpRewardsData)
    }

    return stakedAstroLpRewards.map((reward) => ({
      lpDenom: reward.lp_coin.denom,
      rewards: reward.rewards.map((reward) => new BNCoin(reward)),
    }))
  } catch (ex) {
    return [] as StakedAstroLpRewards[]
  }
}
