import { getPerpsQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'classes/BNCoin'

export default async function getOpeningFee(
  chainConfig: ChainConfig,
  denom: string,
  amount: string,
) {
  const perpsClient = await getPerpsQueryClient(chainConfig)

  return perpsClient
    .openingFee({ denom, size: amount as any })
    .then((resp) => BNCoin.fromCoin(resp.fee))
}
