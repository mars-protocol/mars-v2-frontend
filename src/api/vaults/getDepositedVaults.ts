import moment from 'moment'

import {
  cacheFn,
  estimateWithdrawCache,
  positionsCache,
  previewRedeemCache,
  unlockPositionsCache,
} from 'api/cache'
import { getClient, getCreditManagerQueryClient, getVaultQueryClient } from 'api/cosmwasm-client'
import getPrice from 'api/prices/getPrice'
import getVaults from 'api/vaults/getVaults'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums/vault'
import {
  Positions,
  VaultPosition,
  VaultPositionAmount,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

async function getUnlocksAtTimestamp(unlockingId: number, vaultAddress: string) {
  try {
    const client = await getClient()

    const vaultExtension = (await cacheFn(
      () =>
        client.queryContractSmart(vaultAddress, {
          vault_extension: { lockup: { unlocking_position: { lockup_id: unlockingId } } },
        }),
      unlockPositionsCache,
      `unlockPositions/${vaultAddress}.id/${unlockingId}`,
      60,
    )) as VaultExtensionResponse

    return Number(vaultExtension.release_at.at_time) / 1e6
  } catch (ex) {
    throw ex
  }
}

async function getVaultPositionStatusAndUnlockIdAndUnlockTime(
  vaultPosition: VaultPosition,
): Promise<[VaultStatus, number | undefined, number | undefined]> {
  const amount = vaultPosition.amount

  if (VaultStatus.UNLOCKED in amount) return [VaultStatus.UNLOCKED, undefined, undefined]

  if (amount.locking.unlocking.length) {
    const unlockId = amount.locking.unlocking[0].id
    const unlocksAtTimestamp = await getUnlocksAtTimestamp(unlockId, vaultPosition.vault.address)

    if (moment(unlocksAtTimestamp).isBefore(new Date())) {
      return [VaultStatus.UNLOCKED, unlockId, unlocksAtTimestamp]
    }

    return [VaultStatus.UNLOCKING, unlockId, unlocksAtTimestamp]
  } else {
    return [VaultStatus.ACTIVE, undefined, undefined]
  }
}

export function flatVaultPositionAmount(
  vaultPositionAmount: VaultPositionAmount,
): VaultPositionFlatAmounts {
  const amounts = {
    locked: BN_ZERO,
    unlocking: BN_ZERO,
    unlocked: BN_ZERO,
  }

  if ('locking' in vaultPositionAmount) {
    const { locked, unlocking } = vaultPositionAmount.locking
    amounts.locked = BN(locked)
    amounts.unlocking = BN(unlocking[0]?.coin.amount ?? '0')
  } else if ('unlocked' in vaultPositionAmount) {
    amounts.unlocked = BN(vaultPositionAmount.unlocked)
  }

  return amounts
}

export async function getLpTokensForVaultPosition(
  vault: Vault,
  vaultPosition: VaultPosition,
): Promise<Coin[]> {
  try {
    const vaultQueryClient = await getVaultQueryClient(vault.address)
    const creditManagerQueryClient = await getCreditManagerQueryClient()
    const amounts = flatVaultPositionAmount(vaultPosition.amount)
    const totalAmount = amounts.locked.plus(amounts.unlocked).plus(amounts.unlocking).toString()

    const lpAmount = await cacheFn(
      () =>
        vaultQueryClient.previewRedeem({
          amount: totalAmount,
        }),
      previewRedeemCache,
      `previewRedeem/vaults/${vault.address}/amount/${totalAmount}`,
      60,
    )

    const lpTokens = await cacheFn(
      () =>
        creditManagerQueryClient.estimateWithdrawLiquidity({
          lpToken: {
            amount: lpAmount,
            denom: vault.denoms.lp,
          },
        }),
      estimateWithdrawCache,
      `lpToken/${vault.denoms.lp}/amount/${lpAmount}`,
      60,
    )

    const primaryLpToken = lpTokens.find((t) => t.denom === vault.denoms.primary) ?? {
      amount: '0',
      denom: vault.denoms.primary,
    }
    const secondaryLpToken = lpTokens.find((t) => t.denom === vault.denoms.secondary) ?? {
      amount: '0',
      denom: vault.denoms.secondary,
    }

    return [primaryLpToken, secondaryLpToken]
  } catch (ex) {
    throw ex
  }
}

async function getVaultValuesAndAmounts(
  vault: Vault,
  vaultPosition: VaultPosition,
): Promise<VaultValuesAndAmounts> {
  try {
    const pricesQueries = Promise.all([
      getPrice(vault.denoms.primary),
      getPrice(vault.denoms.secondary),
      getPrice(vault.denoms.lp),
    ])

    const lpTokensQuery = getLpTokensForVaultPosition(vault, vaultPosition)
    const amounts = flatVaultPositionAmount(vaultPosition.amount)

    const [[primaryLpToken, secondaryLpToken], [primaryPrice, secondaryPrice, lpPrice]] =
      await Promise.all([lpTokensQuery, pricesQueries])

    return {
      amounts: {
        ...amounts,
        primary: BN(primaryLpToken.amount),
        secondary: BN(secondaryLpToken.amount),
      },
      values: {
        primary: getCoinValue(new BNCoin(primaryLpToken), [
          BNCoin.fromDenomAndBigNumber(primaryLpToken.denom, primaryPrice),
        ]),
        secondary: getCoinValue(new BNCoin(secondaryLpToken), [
          BNCoin.fromDenomAndBigNumber(secondaryLpToken.denom, secondaryPrice),
        ]),
        unlocking: getCoinValue(BNCoin.fromDenomAndBigNumber(vault.denoms.lp, amounts.unlocking), [
          BNCoin.fromDenomAndBigNumber(vault.denoms.lp, lpPrice),
        ]),
        unlocked: getCoinValue(BNCoin.fromDenomAndBigNumber(vault.denoms.lp, amounts.unlocked), [
          BNCoin.fromDenomAndBigNumber(vault.denoms.lp, lpPrice),
        ]),
      },
    }
  } catch (ex) {
    throw ex
  }
}

async function getDepositedVaults(
  accountId: string,
  positions?: Positions,
): Promise<DepositedVault[]> {
  try {
    const creditManagerQueryClient = await getCreditManagerQueryClient()

    if (!positions)
      positions = await cacheFn(
        () => creditManagerQueryClient.positions({ accountId }),
        positionsCache,
        `depositedVaults/${accountId}`,
      )

    if (!positions.vaults.length) return []

    const [allVaults] = await Promise.all([getVaults()])

    const depositedVaults = positions.vaults.map(async (vaultPosition) => {
      const vault = allVaults.find((v) => v.address === vaultPosition.vault.address)

      if (!vault) {
        throw 'Could not find the deposited vault among all vaults'
      }

      const [[status, unlockId, unlocksAt], valuesAndAmounts] = await Promise.all([
        getVaultPositionStatusAndUnlockIdAndUnlockTime(vaultPosition),
        getVaultValuesAndAmounts(vault, vaultPosition),
      ])

      return {
        ...vault,
        status,
        unlockId,
        unlocksAt,
        ...valuesAndAmounts,
      }
    })

    return await Promise.all(depositedVaults)
  } catch (ex) {
    throw ex
  }
}

export default getDepositedVaults
