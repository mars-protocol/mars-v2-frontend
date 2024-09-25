import moment from 'moment'
import useSWR from 'swr'

import { PERPS_DEFAULT_ACTION } from 'constants/perps'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { BN } from 'utils/helpers'

export default function usePerpsVault() {
  const chainConfig = useChainConfig()
  const clients = useClients()

  return useSWR(
    clients && `chains/${chainConfig.id}/perps/vault`,
    async (): Promise<PerpsVault> => {
      const vaultState = await clients!.perps.vault(PERPS_DEFAULT_ACTION)
      const perpsVault = await clients!.perps.config()
      let perpVaultApy = 0
      try {
        if (chainConfig.endpoints.aprs.perpsVault) {
          const response = await fetch(chainConfig.endpoints.aprs.perpsVault)
          if (response.ok) {
            const data = await response.json()
            perpVaultApy = data.projected_apy
          }
        }
      } catch (e) {
        console.error(e)
      }

      const timeframe = moment.duration(perpsVault.cooldown_period, 'seconds').humanize().split(' ')

      return {
        name: 'Perps USDC Vault',
        provider: 'MARS',
        denom: perpsVault.base_denom,
        apy: perpVaultApy,
        collateralizationRatio: 1.1,
        liquidity: BN(vaultState.total_liquidity),
        lockup: {
          duration: +timeframe[0],
          timeframe: timeframe[1],
        },
        cap: null,
      }
    },
  )
}
