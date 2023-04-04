export function getRouteParams(url: string | null): PageParams {
  const segments = (url || location.href).split('/')

  const params = {
    wallet: '',
    account: '',
    page: '',
  }

  segments.forEach((segment, index) => {
    if (segment === 'wallets' && segments[index + 1]) {
      params.address = segments[index + 1]
    } else if (segment === 'accounts' && segments[index + 1]) {
      params.accountId = segments[index + 1]
    } else if (index === 5) {
      params.page = segment
    }
  })

  return params
}

export function getRoute(
  url: string,
  overrides?: {
    wallet?: string
    account?: string
    page?: RouteSegment
  },
) {
  const params = getRouteParams(url)

  let nextUrl = ''
  let wallet = ''
  let account = ''
  let page = ''

  if (params.address) wallet = params.address
  if (overrides?.wallet) wallet = overrides.wallet

  if (params.accountId) account = params.accountId
  if (overrides?.account) account = overrides.account

  if (params.page) page = params.page
  if (overrides?.page) page = overrides.page

  if (wallet) {
    nextUrl += `/wallets/${wallet}`

    if (account) {
      nextUrl += `/accounts/${account}`
    }
  }

  if (page) {
    nextUrl += `/${page}`
  }

  return nextUrl
}
