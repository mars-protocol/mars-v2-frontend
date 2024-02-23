import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import { ICNSQueryClient } from 'types/classes/ICNSClient.client'
import { MarsAccountNftQueryClient } from 'types/generated/mars-account-nft/MarsAccountNft.client'
import { MarsCreditManagerQueryClient } from 'types/generated/mars-credit-manager/MarsCreditManager.client'
import { MarsIncentivesQueryClient } from 'types/generated/mars-incentives/MarsIncentives.client'
import { MarsOracleOsmosisQueryClient } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.client'
import { MarsParamsQueryClient } from 'types/generated/mars-params/MarsParams.client'
import { MarsPerpsQueryClient } from 'types/generated/mars-perps/MarsPerps.client'
import { MarsRedBankQueryClient } from 'types/generated/mars-red-bank/MarsRedBank.client'
import { MarsSwapperOsmosisQueryClient } from 'types/generated/mars-swapper-osmosis/MarsSwapperOsmosis.client'
import { getUrl } from 'utils/url'

export default function useClients() {
  const chainConfig = useChainConfig()

  const swr = useSWR(
    `chains/${chainConfig.id}/clients`,
    async () => {
      const client = await CosmWasmClient.connect(getUrl(chainConfig.endpoints.rpc))
      return {
        creditManager: new MarsCreditManagerQueryClient(
          client,
          chainConfig.contracts.creditManager,
        ),
        accountNft: new MarsAccountNftQueryClient(client, chainConfig.contracts.accountNft),
        oracle: new MarsOracleOsmosisQueryClient(client, chainConfig.contracts.oracle),
        params: new MarsParamsQueryClient(client, chainConfig.contracts.params),
        redBank: new MarsRedBankQueryClient(client, chainConfig.contracts.redBank),
        swapper: new MarsSwapperOsmosisQueryClient(client, chainConfig.contracts.swapper),
        incentives: new MarsIncentivesQueryClient(client, chainConfig.contracts.incentives),
        perps: new MarsPerpsQueryClient(client, chainConfig.contracts.perps),
        icns: new ICNSQueryClient(client),
      } as ContractClients
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      keepPreviousData: false,
    },
  )

  return swr.data
}
