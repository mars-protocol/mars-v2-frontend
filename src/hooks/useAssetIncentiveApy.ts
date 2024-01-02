import useSWR from 'swr'

import calculateAssetIncentivesApy from 'api/incentives/calculateAssetIncentivesApy'
import useChainConfig from 'hooks/useChainConfig'

export default function useAssetIncentivesApy(denom: string) {
  const chainConfig = useChainConfig()
  return useSWR(
    `chains/${chainConfig.id}/assets/${denom}/incentives`,
    () => calculateAssetIncentivesApy(chainConfig, denom),
    {
      revalidateOnFocus: false,
    },
  )
}
