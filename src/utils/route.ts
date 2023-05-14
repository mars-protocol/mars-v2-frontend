export function getRoute(
  params: {
    address?: string
    accountId?: string
    page?: RouteSegment
  },
  overrides?: {
    address?: string
    accountId?: string
    page?: RouteSegment
  },
) {
  let nextUrl = ''

  const address = overrides?.address
    ? overrides.address
    : params.address
    ? params.address
    : undefined
  const accountId = overrides?.accountId
    ? overrides.accountId
    : params.accountId
    ? params.accountId
    : undefined
  const page = overrides?.page ? overrides.page : params.page ? params.page : 'trade'

  if (address) {
    nextUrl += `/wallets/${address}`

    if (accountId) {
      nextUrl += `/accounts/${accountId}`
    }
  }

  nextUrl += `/${page}`
  return nextUrl
}
