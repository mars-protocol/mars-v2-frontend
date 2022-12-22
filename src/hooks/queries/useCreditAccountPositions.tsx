import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useNetworkConfigStore, useWalletStore } from 'stores'
import { queryKeys } from 'types/query-keys-factory'

interface DebtAmount {
  amount: string
  denom: string
  shares: string
}

interface VaultPosition {
  locked: string
  unlocked: string
}

interface Result {
  account_id: string
  coins: Coin[]
  debts: DebtAmount[]
  vaults: VaultPosition[]
}

export const useCreditAccountPositions = (accountId: string) => {
  const address = useWalletStore((s) => s.address)
  const client = useWalletStore((s) => s.signingClient)
  const creditManagerAddress = useNetworkConfigStore((s) => s.contracts.creditManager)

  const result = useQuery<Result>(
    queryKeys.creditAccountsPositions(accountId),
    async () =>
      client?.queryContractSmart(creditManagerAddress, {
        positions: {
          account_id: accountId,
        },
      }),
    {
      enabled: !!address && !!client,
      refetchInterval: 30000,
      staleTime: Infinity,
    },
  )

  return {
    ...result,
    data: useMemo(() => {
      if (!address) return

      return result?.data && { ...result.data }
    }, [result.data, address]),
  }
}
