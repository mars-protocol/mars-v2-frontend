import { Coin } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import useStore from 'store'
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
  if (!ENV.ADDRESS_CREDIT_MANAGER) {
    console.error(ENV_MISSING_MESSAGE)
    return null
  }

  const address = useStore((s) => s.address)
  const client = useStore((s) => s.signingClient)
  const creditManagerAddress = ENV.ADDRESS_CREDIT_MANAGER

  const result = useQuery<Result>(
    queryKeys.creditAccountsPositions(accountId),
    async () =>
      client?.queryContractSmart(creditManagerAddress || '', {
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
