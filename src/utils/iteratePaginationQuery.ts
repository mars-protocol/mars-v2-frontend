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

export async function iteratePaginationQuery<T extends KeyProperties>(
  query: PaginationQuery<T>,
  keyProperty: keyof KeyProperties = 'denom',
  previousResults?: T[],
): Promise<T[]> {
  const lastItem = previousResults && previousResults.at(-1)
  const lastItemKey = lastItem && lastItem[keyProperty]
  const params = {
    limit: 1,
    startAfter: lastItemKey,
  }

  const paginationResponse = await query(params)
  const accumulated = (previousResults ?? []).concat(paginationResponse.data)

  if (!paginationResponse.metadata.has_more) {
    return accumulated
  }

  return iteratePaginationQuery(query, keyProperty, accumulated)
}
