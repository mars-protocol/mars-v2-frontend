import useSWR from 'swr'

import calculateAssetIncentivesApy from 'api/incentives/calculateAssetIncentivesApy'
import useChainConfig from 'hooks/useChainConfig'

export default function useAssetIncentivesApy(denom: string) {
  const chainConfig = useChainConfig()
  return useSWR(
    `assetIncentiveApy-${denom}`,
    () => calculateAssetIncentivesApy(chainConfig, denom),
    {
      revalidateOnFocus: false,
    },
  )
}
