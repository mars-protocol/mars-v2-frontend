import { getPerpsQueryClient } from 'api/cosmwasm-client'

export default async function getPerpsPosition(
  chainConfig: ChainConfig,
  denom: string,
  amount: string,
  accountId: string,
) {
  const perpsClient = await getPerpsQueryClient(chainConfig)

  return perpsClient.position({ denom, orderSize: amount as any, accountId })
}
