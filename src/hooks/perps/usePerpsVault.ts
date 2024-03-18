import moment from 'moment'
import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import { BN } from 'utils/helpers'

export default function usePerpsVault() {
  const chainConfig = useChainConfig()
  const clients = useClients()

  return useSWR(
    clients && `chains/${chainConfig.id}/perps/vault`,
    async (): Promise<PerpsVault> => {
      const vaultState = await clients!.perps.vaultState()
      const perpsVault = await clients!.perps.config()

      const timeframe = moment.duration(perpsVault.cooldown_period, 'seconds').humanize().split(' ')

      return {
        name: 'Perps USDC Vault',
        provider: 'MARS',
        denom: perpsVault.base_denom,
        apy: 0,
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
