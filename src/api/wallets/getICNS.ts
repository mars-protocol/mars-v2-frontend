import { getICNSQueryClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'
import { ChainInfoID } from 'types/enums/wallet'

export default async function getICNS(address?: string): Promise<ICNSResult | undefined> {
  if (!address || ENV.CHAIN_ID !== ChainInfoID.Osmosis1) return
  try {
    const icnsQueryClient = await getICNSQueryClient()
    return icnsQueryClient.primaryName({ address })
  } catch (ex) {
    throw ex
  }
}
