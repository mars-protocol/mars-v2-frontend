import { useMemo } from 'react'

import { getVaultAccountStrategiesRow } from 'components/account/AccountStrategiesTable/functions'
import usePrices from 'hooks/usePrices'
import useVaultAprs from 'hooks/vaults/useVaultAprs'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountStategiesData(props: Props) {
  const { account, updatedAccount } = props
  const { data: prices } = usePrices()
  const { data: vaultAprs } = useVaultAprs()
  return useMemo<AccountStrategyRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountVaults = usedAccount?.vaults ?? []

    return accountVaults.map((vault) => {
      const apy = vaultAprs.find((vaultApr) => vaultApr.address === vault.address)?.apy
      const prevVault = updatedAccount
        ? account?.vaults.find((position) => position.name === vault.name)
        : vault

      return getVaultAccountStrategiesRow(vault, prices, apy, prevVault)
    })
  }, [updatedAccount, account, vaultAprs, prices])
}
