import moment from 'moment'

import { getClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'
import getVaults from 'api/vaults/getVaults'
import {
  Positions,
  VaultPosition,
  VaultPositionAmount,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { BN } from 'utils/helpers'
import getPrice from 'api/prices/getPrice'

async function getUnlocksAtTimestamp(unlockingId: number, vaultAddress: string) {
  const client = await getClient()

  const vaultExtension = (await client.queryContractSmart(vaultAddress, {
    vault_extension: { lockup: { unlocking_position: { lockup_id: unlockingId } } },
  })) as VaultExtensionResponse

  return Number(vaultExtension.release_at.at_time) / 1e6
}

async function getVaultPositionStatusAndUnlockTime(
  vaultPosition: VaultPosition,
): Promise<[ActiveVaultStatus, number | undefined]> {
  const amount = vaultPosition.amount

  if ('unlocked' in amount) return ['unlocked', undefined]

  if (amount.locking.unlocking.length) {
    const unlocksAtTimestamp = await getUnlocksAtTimestamp(
      amount.locking.unlocking[0].id,
      vaultPosition.vault.address,
    )

    if (moment(unlocksAtTimestamp).isBefore(new Date())) {
      return ['unlocked', unlocksAtTimestamp]
    }

    return ['unlocking', unlocksAtTimestamp]
  } else {
    return ['active', undefined]
  }
}

function flatVaultPositionAmount(
  vaultPositionAmount: VaultPositionAmount,
): VaultPositionFlatAmounts {
  const amounts = {
    locked: '0',
    unlocking: '0',
    unlocked: '0',
  }

  if ('locking' in vaultPositionAmount) {
    const { locked, unlocking } = vaultPositionAmount.locking
    amounts.locked = locked
    amounts.unlocking = unlocking[0]?.coin.amount ?? '0'
  } else if ('unlocked' in vaultPositionAmount) {
    amounts.unlocked = vaultPositionAmount.unlocked
  }

  return amounts
}

async function getLpTokens(vault: Vault, vaultPosition: VaultPosition): Promise<Coin[]> {
  try {
    const client = await getClient()
    const amounts = flatVaultPositionAmount(vaultPosition.amount)
    const totalAmount = BN(amounts.locked)
      .plus(BN(amounts.unlocked))
      .plus(BN(amounts.unlocking))
      .toString()

    const lpAmount = await client.queryContractSmart(vault.address, {
      preview_redeem: {
        amount: totalAmount,
      },
    })

    const lpTokens = await client.queryContractSmart(ENV.ADDRESS_CREDIT_MANAGER, {
      estimate_withdraw_liquidity: {
        lp_token: {
          amount: lpAmount,
          denom: vault.denoms.lp,
        },
      },
    })

    return lpTokens
  } catch (ex) {
    throw ex
  }
}

async function getVaultValuesAndAmounts(
  vault: Vault,
  vaultPosition: VaultPosition,
): Promise<VaultValuesAndAmounts> {
  const pricesQueries = Promise.all([
    getPrice(vault.denoms.primary),
    getPrice(vault.denoms.secondary),
  ])

  const lpTokensQuery = getLpTokens(vault, vaultPosition)

  const [lpTokens, [primaryAsset, secondaryAsset]] = await Promise.all([
    lpTokensQuery,
    pricesQueries,
  ])

  const primaryLpToken = lpTokens.find((t) => t.denom === primaryAsset.denom) ?? {
    amount: '0',
  }
  const secondaryLpToken = lpTokens.find((t) => t.denom === secondaryAsset.denom) ?? {
    amount: '0',
  }

  return {
    amounts: {
      primary: BN(primaryLpToken.amount),
      secondary: BN(secondaryLpToken.amount),
    },
    values: {
      primary: BN(primaryLpToken.amount).multipliedBy(BN(primaryAsset.price)),
      secondary: BN(secondaryLpToken.amount).multipliedBy(BN(secondaryAsset.price)),
    },
  }
}

async function getDepositedVaults(accountId: string): Promise<ActiveVault[]> {
  const client = await getClient()

  const positionsQuery = client.queryContractSmart(ENV.ADDRESS_CREDIT_MANAGER, {
    positions: {
      account_id: accountId,
    },
  }) as Promise<Positions>

  const [positions, allVaults] = await Promise.all([positionsQuery, getVaults()])

  // TODO: positions seems to be keeping only 1 vault. Check if this is always gonna be the case
  const depositedVaults = positions.vaults.map(async (vaultPosition) => {
    const vault = allVaults.find((v) => v.address === vaultPosition.vault.address)

    if (!vault) {
      throw 'Could not find the deposited vault among all vaults'
    }

    const [[status, unlocksAt], valuesAndAmounts] = await Promise.all([
      getVaultPositionStatusAndUnlockTime(vaultPosition),
      getVaultValuesAndAmounts(vault, vaultPosition),
    ])

    return {
      ...vault,
      status,
      unlocksAt,
      ...valuesAndAmounts,
    }
  })

  return await Promise.all(depositedVaults)
}

export default getDepositedVaults
