import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'

export default function useMinKeeperFee() {
  const chainConfig = useChainConfig()
  const clients = useClients()

  return useSWR(clients && `chains/${chainConfig.id}/creditManager/minKeeperFee`, async () => {
    const config = await clients!.creditManager.config()
    return BNCoin.fromCoin(config.keeper_fee_config.min_fee)
  })
}
