import { ITEM_LIMIT_PER_QUERY } from 'constants/query'
import { KeyProperties } from 'utils/iterateContractQuery'

type PaginationQuery<T> = ({
  limit,
  startAfter,
}: {
  limit?: number
  startAfter?: string
}) => Promise<PaginationResponse<T>>

type PaginationResponse<T> = {
  data: T[]
  metadata: {
    has_more: boolean
  }
}

export async function iteratePaginationQuery<T>(
  query: PaginationQuery<T>,
  keyProperty: keyof KeyProperties = 'denom',
  previousResults?: T[],
): Promise<T[]> {
  const lastItem = previousResults && previousResults.at(-1)
  const lastItemKey = lastItem && lastItem[keyProperty]
  const params = {
    limit: ITEM_LIMIT_PER_QUERY,
    startAfter: lastItemKey,
  }

  const paginationResponse = await query(params)
  const accumulated = (previousResults ?? []).concat(paginationResponse.data)

  if (!paginationResponse.metadata.has_more) {
    return accumulated
  }

  return iteratePaginationQuery(query, keyProperty, accumulated)
}
