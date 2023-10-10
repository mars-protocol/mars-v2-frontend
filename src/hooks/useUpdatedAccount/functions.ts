import { BN_ZERO } from 'constants/math'
import { MOCK_DEPOSITED_VAULT_POSITION } from 'constants/vaults'
import { VaultValue } from 'hooks/useUpdatedAccount'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getVaultMetaData } from 'utils/vaults'

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
  availableVaults: Vault[],
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
      const apy = availableVaults.find((vault) => vault.address === vaultValue.address)?.apy ?? null
      const apr = availableVaults.find((vault) => vault.address === vaultValue.address)?.apr ?? null

      vaults.push({
        ...vaultMetaData,
        ...MOCK_DEPOSITED_VAULT_POSITION,
        apy,
        apr,
        values: {
          primary: halfValue,
          secondary: halfValue,
          unlocked: BN_ZERO,
          unlocking: BN_ZERO,
        },
      })
    }
  })

  return vaults
}

export function getDepositAndLendCoinsToSpend(coin: BNCoin, account?: Account) {
  const makeOutput = (depositsAmount: BigNumber, lendsAmount: BigNumber) => ({
    deposit: BNCoin.fromDenomAndBigNumber(coin.denom, depositsAmount),
    lend: BNCoin.fromDenomAndBigNumber(coin.denom, lendsAmount),
  })

  if (!account) return makeOutput(BN_ZERO, BN_ZERO)

  const accountDepositAmount = account.deposits.find(byDenom(coin.denom))?.amount ?? BN_ZERO
  const accountLendsAmount = account.lends.find(byDenom(coin.denom))?.amount ?? BN_ZERO
  const accountDepositAndLendAmount = accountDepositAmount.plus(accountLendsAmount)

  if (coin.amount.isLessThanOrEqualTo(accountDepositAmount)) {
    return makeOutput(coin.amount, BN_ZERO)
  }

  if (coin.amount.isGreaterThanOrEqualTo(accountDepositAndLendAmount)) {
    return makeOutput(accountDepositAmount, accountLendsAmount)
  }

  return makeOutput(accountDepositAmount, coin.amount.minus(accountDepositAmount))
}
