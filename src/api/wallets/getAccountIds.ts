import { getAccountNftQueryClient } from 'api/cosmwasm-client'
import { ITEM_LIMIT_PER_QUERY } from 'constants/query'

export default async function getAccountIds(
  address?: string,
  previousResults?: string[],
): Promise<string[]> {
  try {
    if (!address) return []
    const accountNftQueryClient = await getAccountNftQueryClient()

    const lastItem = previousResults && previousResults.at(-1)
    const results = await accountNftQueryClient.tokens({
      limit: ITEM_LIMIT_PER_QUERY,
      startAfter: lastItem,
      owner: address,
    })

    const accumulated = (previousResults ?? []).concat(results.tokens)

    if (results.tokens.length < ITEM_LIMIT_PER_QUERY) {
      return accumulated.sort((a, b) => parseInt(a) - parseInt(b))
    }

    return await getAccountIds(address, accumulated)
  } catch {
    return new Promise((_, reject) => reject('No data'))
  }
}
