import { BN_ZERO } from 'constants/math'
import { MOCK_DEPOSITED_VAULT_POSITION } from 'constants/vaults'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

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

export function updatePerpsPositions(
  currentPositions: PerpsPosition[],
  updatedPosition?: PerpsPosition,
): PerpsPosition[] {
  if (!updatedPosition) {
    return currentPositions ?? []
  }
  const currentDenoms = currentPositions.map((position) => position.denom)
  const index = currentDenoms.indexOf(updatedPosition.denom)

  if (index === -1) {
    currentPositions.push(updatedPosition)
    return currentPositions
  }

  currentPositions[index] = updatedPosition

  return currentPositions
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
      const vault = availableVaults.find((vault) => vaultValue.address === vault.address)

      if (!vault) return
      const apy = availableVaults.find((vault) => vault.address === vaultValue.address)?.apy ?? null
      const apr = availableVaults.find((vault) => vault.address === vaultValue.address)?.apr ?? null

      vaults.push({
        ...vault,
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

export function adjustPerpsVaultAmounts(
  perpsVault: PerpsVault,
  depositAmount: BigNumber,
  unlockAmount: BigNumber,
  position: PerpsVaultPositions | null,
): PerpsVaultPositions {
  const perpPosition = {
    active: {
      amount: position?.active ? position.active.amount : BN_ZERO,
      shares: position?.active ? position.active.shares : BN_ZERO,
    },
    denom: perpsVault.denom,
    unlocked: position?.unlocked ?? null,
    unlocking: position?.unlocking ?? [],
  }

  if (perpPosition.active) {
    if (!depositAmount.isZero()) {
      perpPosition.active.amount = perpPosition.active?.amount.plus(depositAmount)
    }

    if (!unlockAmount.isZero()) {
      perpPosition.active.amount = perpPosition.active?.amount.minus(unlockAmount)
      perpPosition.unlocking = [
        { amount: unlockAmount, unlocksAt: Date.now() + perpsVault.lockup.duration * 1000 * 60 },
      ]
    }
  }

  return perpPosition
}
