import useSWR from 'swr'

import getAccountIds from 'api/wallets/getAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAccountIdsAndKinds(address?: string, suspense = true, noHls = false) {
  const chainConfig = useChainConfig()
  return useSWR(
    address &&
      `chains/${chainConfig.id}/wallets/${address}/account-ids${noHls ? '-without-hls' : ''}`,
    () =>
      getAccountIds(chainConfig, address).then((accountIdsAndKinds) => {
        if (noHls) {
          return accountIdsAndKinds
            .filter((accountIdAndKind) => accountIdAndKind.kind !== 'high_levered_strategy')
            .map((a) => a.id)
        }
        return accountIdsAndKinds.map((a) => a.id)
      }),
    {
      suspense: suspense,
      fallback: [] as string[],
      revalidateOnFocus: true,
    },
  )
}
