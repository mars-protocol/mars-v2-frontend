import useSWR from 'swr'

import getDepositedVaults from 'api/vaults/getDepositedVaults'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useAssets from 'hooks/useAssets'
import useChainConfig from 'hooks/useChainConfig'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums/vault'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function useDepositedVaults(accountId: string) {
  const chainConfig = useChainConfig()
  const currentAccount = useCurrentAccount()
  const { data: perpsVault } = usePerpsVault()
  const { data: prices } = usePrices()
  const assets = useAssets()

  return useSWR(
    currentAccount && `chains/${chainConfig.id}/vaults/${accountId}/deposited`,
    async () => {
      const vaults = await getDepositedVaults(accountId, chainConfig)

      if (currentAccount && perpsVault) {
        if (currentAccount.perpVault?.active) {
          const netValue = getCoinValue(
            BNCoin.fromDenomAndBigNumber(
              currentAccount.perpVault.denom,
              currentAccount.perpVault.active.amount,
            ),
            prices,
            assets,
          )
          const activeVault: DepositedVault = {
            type: 'perp',
            ...perpsVault,
            ...currentAccount.perpVault.active,
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
              primary: currentAccount.perpVault.active.amount,
              secondary: BN_ZERO,
              locked: BN_ZERO,
              unlocked: BN_ZERO,
              unlocking: BN_ZERO,
            },
            values: {
              primary: netValue,
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
