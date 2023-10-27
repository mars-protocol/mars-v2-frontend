import useSWR from 'swr'

import getAccounts from 'api/wallets/getAccounts'
import useStore from 'store'
import { AccountKind } from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'

export default function useAccounts(kind: AccountKind, address?: string, suspense = true) {
  return useSWR(`accounts/${kind}`, () => getAccounts(kind, address), {
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
