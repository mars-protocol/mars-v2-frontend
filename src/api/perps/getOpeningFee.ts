import { getPerpsQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getOpeningFee(chainConfig: ChainConfig, denom: string, size: string) {
  const perpsClient = await getPerpsQueryClient(chainConfig)

  return perpsClient
    .openingFee({ denom, size: size as any })
    .then((resp) => BNCoin.fromCoin(resp.fee))
}
