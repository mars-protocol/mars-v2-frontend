import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import useWalletStore from 'stores/useWalletStore'
import { contractAddresses } from 'config/contracts'
import { queryKeys } from 'types/query-keys-factory'

interface Coin {
  amount: string
  denom: string
}

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

const useCreditAccountPositions = (accountId: string) => {
  const address = useWalletStore((s) => s.address)
  const client = useWalletStore((s) => s.client)

  const result = useQuery<Result>(
    queryKeys.creditAccountsPositions(accountId),
    async () =>
      client?.queryContractSmart(contractAddresses.creditManager, {
        positions: {
          account_id: accountId,
        },
      }),
    {
      enabled: !!address && !!client,
      staleTime: Infinity,
    }
  )

  return {
    ...result,
    data: useMemo(() => {
      return result?.data
    }, [result.data]),
  }
}

export default useCreditAccountPositions
