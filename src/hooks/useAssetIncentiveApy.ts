import useSWR from 'swr'

import calculateAssetIncentivesApy from 'api/incentives/calculateAssetIncentivesApy'

export default function useAssetIncentivesApy(denom: string) {
  return useSWR(`assetIncentiveApy-${denom}`, () => calculateAssetIncentivesApy(denom), {
    revalidateOnFocus: false,
  })
}
