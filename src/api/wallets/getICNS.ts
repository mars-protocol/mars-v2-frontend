import { getICNSQueryClient } from 'api/cosmwasm-client'
import { ChainInfoID } from 'types/enums/wallet'

export default async function getICNS(
  chainConfig: ChainConfig,
  address?: string,
): Promise<ICNSResult | undefined> {
  if (!address || chainConfig.id !== ChainInfoID.Osmosis1) return
  try {
    const icnsQueryClient = await getICNSQueryClient(chainConfig)
    return icnsQueryClient.primaryName({ address })
  } catch (ex) {
    throw ex
  }
}
