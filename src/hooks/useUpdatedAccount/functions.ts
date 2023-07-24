import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { VaultValue } from 'hooks/useUpdatedAccount'
import { getVaultMetaData } from 'utils/vaults'
import { MOCK_DEPOSITED_VAULT_POSITION } from 'constants/vaults'

export function addCoins(additionalCoins: BNCoin[], currentCoins: BNCoin[]) {
  const currentDenoms = currentCoins.map((coin) => coin.denom)

  additionalCoins.forEach((coin) => {
    if (coin.amount.isZero()) return

    if (currentDenoms.includes(coin.denom)) {
      const index = currentDenoms.indexOf(coin.denom)
      currentCoins[index].amount = BN(currentCoins[index].amount).plus(coin.amount)
    } else {
      currentCoins.push(coin)
    }
  })

  return currentCoins
}

export function removeCoins(coinsToRemove: BNCoin[], currentCoins: BNCoin[]) {
  const currentDenoms = currentCoins.map((coin) => coin.denom)

  coinsToRemove.forEach((coin) => {
    if (coin.amount.isZero()) return
    if (!currentDenoms.includes(coin.denom)) return

    const index = currentDenoms.indexOf(coin.denom)
    currentCoins[index].amount = BN(currentCoins[index].amount).minus(coin.amount)
  })

  return currentCoins
}

export function addValueToVaults(
  vaultValues: VaultValue[],
  vaults: DepositedVault[],
): DepositedVault[] {
  const currentVaultAddresses = vaults.map((vault) => vault.address)

  vaultValues.forEach((vaultValue) => {
    if (vaultValue.value.isZero()) return
    const halfValue = vaultValue.value.div(2)

    if (currentVaultAddresses.includes(vaultValue.address)) {
      const index = currentVaultAddresses.indexOf(vaultValue.address)
      vaults[index].values.primary = BN(vaults[index].values.primary).plus(halfValue)
      vaults[index].values.secondary = BN(vaults[index].values.secondary).plus(halfValue)
    } else {
      const vaultMetaData = getVaultMetaData(vaultValue.address)

      if (!vaultMetaData) return

      vaults.push({
        ...vaultMetaData,
        ...MOCK_DEPOSITED_VAULT_POSITION,
        values: {
          primary: halfValue,
          secondary: halfValue,
        },
      })
    }
  })

  return vaults
}
