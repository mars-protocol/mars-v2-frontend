import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import useWalletStore from 'stores/useWalletStore'
import { chain } from 'utils/chains'
import { contractAddresses } from 'config/contracts'
import { queryKeys } from 'types/query-keys-factory'

interface CoinValue {
  amount: string
  denom: string
  price: string
  value: string
}

interface DebtSharesValue {
  amount: string
  denom: string
  price: string
  shares: string
  value: string
}

export interface VaultPosition {
  locked: string
  unlocked: string
}

interface VaultPositionWithAddr {
  addr: string
  position: VaultPosition
}

interface Result {
  account_id: string
  coins: CoinValue[]
  debt: DebtSharesValue[]
  vault_positions: VaultPositionWithAddr[]
}

const useCreditAccountPositions = (accountId: string) => {
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient>()
  const address = useWalletStore((state) => state.address)

  useEffect(() => {
    ;(async () => {
      if (!window.keplr) return

      const offlineSigner = window.keplr.getOfflineSigner(chain.chainId)
      const clientInstance = await SigningCosmWasmClient.connectWithSigner(chain.rpc, offlineSigner)

      setSigningClient(clientInstance)
    })()
  }, [address])

  const result = useQuery<Result>(
    queryKeys.creditAccountsPositions(accountId),
    async () =>
      signingClient?.queryContractSmart(contractAddresses.creditManager, {
        positions: {
          account_id: accountId,
        },
      }),
    {
      enabled: !!address && !!signingClient,
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
