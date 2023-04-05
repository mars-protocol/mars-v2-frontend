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
  url: string,
  overrides?: {
    address?: string
    accountId?: string
    page?: RouteSegment
  },
) {
  const params = getRouteParams(url)

  let nextUrl = ''
  let address = ''
  let accountId = ''
  let page = ''

  if (params.address) address = params.address
  if (overrides?.address) address = overrides.address

  if (params.accountId) accountId = params.accountId
  if (overrides?.accountId) accountId = overrides.accountId

  if (params.page) page = params.page
  if (overrides?.page) page = overrides.page

  if (address) {
    nextUrl += `/wallets/${address}`

    if (accountId) {
      nextUrl += `/accounts/${accountId}`
    }
  }

  if (page) {
    nextUrl += `/${page}`
  }

  return nextUrl
}
