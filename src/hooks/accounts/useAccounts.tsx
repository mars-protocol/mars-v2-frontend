import useSWR from 'swr'

import getAccounts from 'api/wallets/getAccounts'
import useChainConfig from 'hooks/useChainConfig'
import { AccountKind } from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'

export default function useAccounts(kind: AccountKind, address?: string, suspense = true) {
  const chainConfig = useChainConfig()

  return useSWR(
    address && `chains/${chainConfig.id}/accounts/${kind}`,
    () => getAccounts(kind, chainConfig, address),
    {
      suspense: suspense,
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
