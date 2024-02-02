import { useMemo } from 'react'

import { getVaultAccountStrategiesRow } from 'components/account/AccountStrategiesTable/functions'
import usePrices from 'hooks/usePrices'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountStategiesData(props: Props) {
  const { account, updatedAccount } = props
  const { data: prices } = usePrices()
  return useMemo<AccountStrategyRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountVaults = usedAccount?.vaults ?? []

    return accountVaults.map((vault) => {
      const apy = vault.apy ?? 0
      const prevVault = updatedAccount
        ? account?.vaults.find((position) => position.name === vault.name)
        : vault
      console.log('prevVault', updatedAccount?.vaults)

      return getVaultAccountStrategiesRow(vault, apy, prices, prevVault)
    })
  }, [account, updatedAccount, prices])
}
