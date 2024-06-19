import { BNCoin } from 'types/classes/BNCoin'

export default async function getOpeningFee(
  chainConfig: ChainConfig,
  denom: string,
  amount: string,
) {
  /* PERPS
  const perpsClient = await getPerpsQueryClient(chainConfig)

  return perpsClient
    .openingFee({ denom, size: amount as any })
    .then((resp) => BNCoin.fromCoin(resp.fee))

    */

  return BNCoin.fromCoin({ amount: '0', denom: 'uusd' })
}
