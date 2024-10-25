import useSWR from 'swr'

import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function useDepositedVaults(accountId: string) {
  const chainConfig = useChainConfig()
  const currentAccount = useCurrentAccount()
  const { data: perpsVault } = usePerpsVault()
  const { data: assets } = useAssets()

  return useSWR(
    currentAccount && `chains/${chainConfig.id}/vaults/${accountId}/deposited`,
    async () => {
      let vaults = await getDepositedVaults(accountId, chainConfig, assets)

      if (currentAccount && perpsVault) {
        vaults = [
          ...vaults,
          ...transformPerpsVaultIntoDeposited(currentAccount, perpsVault, assets),
        ]
      }

      return vaults
    },
    {
      refreshInterval: 5_000,
      suspense: true,
      revalidateOnFocus: false,
      fallbackData: [],
    },
  )
}

export function transformPerpsVaultIntoDeposited(
  account: Account,
  perpsVault: PerpsVault,
  assets: Asset[],
) {
  const vaults: DepositedVault[] = []

  const depositedTemplate: DepositedVault = {
    type: 'perp',
    ...perpsVault,
    status: VaultStatus.ACTIVE,
    cap: {
      used: perpsVault.liquidity,
      denom: perpsVault.denom,
      max: BN(9e12), // Placeholder value. There is no deposit cap currently
    },
    denoms: {
      primary: perpsVault.denom,
      secondary: '',
      lp: '',
      vault: '',
    },
    address: '',
    ltv: {
      max: 0,
      liq: 0,
    },
    symbols: {
      primary: '',
      secondary: '',
    },
    amounts: {
      primary: BN_ZERO,
      secondary: BN_ZERO,
      locked: BN_ZERO,
      unlocked: BN_ZERO,
      unlocking: BN_ZERO,
    },
    values: {
      primary: BN_ZERO,
      secondary: BN_ZERO,
      unlocked: BN_ZERO,
      unlocking: BN_ZERO,
    },
  }

  if (account.perpsVault?.active) {
    const netValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(account.perpsVault.denom, account.perpsVault.active.amount),
      assets,
    )
    const activeVault: DepositedVault = {
      ...depositedTemplate,
      status: VaultStatus.ACTIVE,
      ...account.perpsVault.active, // TODO: Is this needed?
      amounts: {
        ...depositedTemplate.amounts,
        primary: BN(account.perpsVault.active.amount),
      },
      values: {
        ...depositedTemplate.values,
        primary: netValue,
      },
    }
    vaults.push(activeVault)
  }

  if (account.perpsVault?.unlocked) {
    const netValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(account.perpsVault.denom, account.perpsVault.unlocked),
      assets,
    )

    const unlockedVault: DepositedVault = {
      ...depositedTemplate,
      status: VaultStatus.UNLOCKED,
      unlocksAt: 0,
      amounts: {
        ...depositedTemplate.amounts,
        primary: BN(account.perpsVault.unlocked),
      },
      values: {
        ...depositedTemplate.values,
        primary: netValue,
      },
    }

    vaults.push(unlockedVault)
  }

  if (account.perpsVault?.unlocking) {
    for (const unlock of account.perpsVault.unlocking) {
      const unlockingVault: DepositedVault = {
        ...depositedTemplate,
        status: VaultStatus.UNLOCKING,
        unlocksAt: unlock.unlocksAt,
        amounts: {
          ...depositedTemplate.amounts,
          primary: unlock.amount,
        },
        values: {
          ...depositedTemplate.values,
          primary: getCoinValue(
            BNCoin.fromDenomAndBigNumber(account.perpsVault.denom, unlock.amount),
            assets,
          ),
        },
      }
      vaults.push(unlockingVault)
    }
  }

  return vaults
}
