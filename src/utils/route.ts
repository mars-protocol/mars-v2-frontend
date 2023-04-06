export function getRouteParams(url: string | null): PageParams {
  const href = typeof location !== 'undefined' ? location.href : ''
  const segments = (url || href).split('/')

  const params = {
    address: '',
    accountId: '',
    page: '',
  }

  segments.forEach((segment, index) => {
    switch (segment) {
      case 'wallets':
        params.address = segments[index + 1]
        break
      case 'accounts':
        params.accountId = segments[index + 1]
        break
      default:
        if (index === 3 || index === 5 || index === 7) params.page = segment
    }
  })
  if (!params.page) params.page = 'trade'

  return params
}

export function getRoute(
  params: PageParams,
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
