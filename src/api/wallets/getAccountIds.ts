import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { ITEM_LIMIT_PER_QUERY } from 'constants/query'

export default async function getAccountIds(
  chainConfig: ChainConfig,
  address?: string,
  previousResults?: AccountIdAndKind[],
): Promise<AccountIdAndKind[]> {
  if (!address) return []
  try {
    const client = await getCreditManagerQueryClient(chainConfig.endpoints.rpc)

    const lastItem = previousResults && previousResults.at(-1)
    const accounts = (
      await client.accounts({
        limit: ITEM_LIMIT_PER_QUERY,
        startAfter: lastItem?.id,
        owner: address,
      })
    ).map((account) => ({ id: account.id, kind: account.kind }) as AccountIdAndKind)

    const accumulated = (previousResults ?? []).concat(accounts)

    if (accounts.length < ITEM_LIMIT_PER_QUERY) {
      return accumulated.sort((a, b) => parseInt(a.id) - parseInt(b.id))
    }

    return await getAccountIds(chainConfig, address, accumulated)
  } catch {
    return new Promise((_, reject) => reject('No data'))
  }
}
