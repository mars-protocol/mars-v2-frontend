import dayjs from 'utils/dayjs'

import { getClient, getCreditManagerQueryClient, getVaultQueryClient } from 'api/cosmwasm-client'
import getVaults from 'api/vaults/getVaults'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums'
import {
  Positions,
  VaultPosition,
  VaultPositionAmount,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { getUrl } from 'utils/url'

async function getUnlocksAtTimestamp(
  chainConfig: ChainConfig,
  unlockingId: number,
  vaultAddress: string,
) {
  try {
    const client = await getClient(getUrl(chainConfig.endpoints.rpc))
    const vaultExtension = (await client.queryContractSmart(vaultAddress, {
      vault_extension: { lockup: { unlocking_position: { lockup_id: unlockingId } } },
    })) as VaultExtensionResponse

    return Number(vaultExtension.release_at.at_time) / 1e6
  } catch (ex) {
    throw ex
  }
}

async function getVaultPositionStatusAndUnlockIdAndUnlockTime(
  chainConfig: ChainConfig,
  vaultPosition: VaultPosition,
): Promise<[VaultStatus, number | undefined, number | undefined]> {
  const amount = vaultPosition.amount

  if (VaultStatus.UNLOCKED in amount) return [VaultStatus.UNLOCKED, undefined, undefined]

  if (amount.locking.unlocking.length) {
    const unlockId = amount.locking.unlocking[0].id
    const unlocksAtTimestamp = await getUnlocksAtTimestamp(
      chainConfig,
      unlockId,
      vaultPosition.vault.address,
    )

    if (dayjs(unlocksAtTimestamp).isBefore(new Date())) {
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
  chainConfig: ChainConfig,
  vault: Vault,
  vaultPosition: VaultPosition,
): Promise<Coin[]> {
  try {
    const vaultQueryClient = await getVaultQueryClient(chainConfig, vault.address)
    const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)
    const amounts = flatVaultPositionAmount(vaultPosition.amount)
    const totalAmount = amounts.locked.plus(amounts.unlocked).plus(amounts.unlocking).toString()

    const lpAmount = await vaultQueryClient.previewRedeem({
      amount: totalAmount,
    })

    const lpTokens = await creditManagerQueryClient.estimateWithdrawLiquidity({
      lpToken: {
        amount: lpAmount,
        denom: vault.denoms.lp,
      },
    })

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
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<VaultValuesAndAmounts> {
  try {
    const lpTokensQuery = getLpTokensForVaultPosition(chainConfig, vault, vaultPosition)
    const amounts = flatVaultPositionAmount(vaultPosition.amount)

    const [primaryLpToken, secondaryLpToken] = await lpTokensQuery

    return {
      amounts: {
        ...amounts,
        primary: BN(primaryLpToken.amount),
        secondary: BN(secondaryLpToken.amount),
      },
      values: {
        primary: getCoinValue(new BNCoin(primaryLpToken), assets),
        secondary: getCoinValue(new BNCoin(secondaryLpToken), assets),
        unlocking: getCoinValue(
          BNCoin.fromDenomAndBigNumber(vault.denoms.lp, amounts.unlocking),
          assets,
        ),
        unlocked: getCoinValue(
          BNCoin.fromDenomAndBigNumber(vault.denoms.lp, amounts.unlocked),
          assets,
        ),
      },
    }
  } catch (ex) {
    throw ex
  }
}

async function getDepositedVaults(
  accountId: string,
  chainConfig: ChainConfig,
  assets: Asset[],
  positions?: Positions,
): Promise<DepositedVault[]> {
  try {
    const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)

    if (!positions) positions = await creditManagerQueryClient.positions({ accountId })

    if (!positions.vaults.length) return []

    const [allVaults] = await Promise.all([getVaults(chainConfig)])

    const depositedVaults = positions.vaults.map(async (vaultPosition) => {
      const vault = allVaults.find((v) => v.address === vaultPosition.vault.address)

      if (!vault) {
        throw 'Could not find the deposited vault among all vaults'
      }

      const [[status, unlockId, unlocksAt], valuesAndAmounts] = await Promise.all([
        getVaultPositionStatusAndUnlockIdAndUnlockTime(chainConfig, vaultPosition),
        getVaultValuesAndAmounts(vault, vaultPosition, chainConfig, assets),
      ])

      return {
        ...vault,
        status,
        unlockId,
        unlocksAt,
        ...valuesAndAmounts,
        type: 'normal',
      } as DepositedVault
    })

    return await Promise.all(depositedVaults)
  } catch (ex) {
    throw ex
  }
}

export default getDepositedVaults
