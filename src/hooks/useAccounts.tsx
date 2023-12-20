import useSWR from 'swr'

import getAccounts from 'api/wallets/getAccounts'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'
import { AccountKind } from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'

export default function useAccounts(kind: AccountKind, address?: string, suspense = true) {
  const chainConfig = useChainConfig()

  return useSWR(`accounts/${kind}`, () => getAccounts(kind, chainConfig, address), {
    suspense: suspense,
    fallbackData: [],
    revalidateOnFocus: false,
    onSuccess: (accounts) => {
      if (kind === 'high_levered_strategy') {
        useStore.setState({ hlsAccounts: accounts })
        return
      }
      useStore.setState({ accounts: accounts })
    },
  })
}
