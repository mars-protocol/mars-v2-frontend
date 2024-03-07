import useSWR from 'swr'

import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useChainConfig from 'hooks/useChainConfig'
import { VaultStatus } from 'types/enums/vault'

export default function useDepositedVaults(accountId: string) {
  const chainConfig = useChainConfig()
  const currentAccount = useCurrentAccount()
  const { data: perpsVault } = usePerpsVault()

  return useSWR(
    currentAccount && `chains/${chainConfig.id}/vaults/${accountId}/deposited`,
    async () => {
      const vaults = await getDepositedVaults(accountId, chainConfig)

      if (currentAccount && perpsVault) {
        if (currentAccount.perpVault?.active) {
          const activeVault: DepositedVault = {
            type: 'perp',
            ...perpsVault,
            ...currentAccount.perpVault.active,
            status: VaultStatus.ACTIVE,
            cap: null,
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
              primary: currentAccount.perpVault.active.amount,
              secondary: BN_ZERO,
              locked: BN_ZERO,
              unlocked: BN_ZERO,
              unlocking: BN_ZERO,
            },
            values: {
              primary: currentAccount.perpVault.active.amount,
              secondary: BN_ZERO,
              unlocked: BN_ZERO,
              unlocking: BN_ZERO,
            },
          }

          vaults.push(activeVault)
        }
      }

      return vaults || []
    },
    {
      suspense: true,
      revalidateOnFocus: false,
      fallbackData: [],
    },
  )
}
