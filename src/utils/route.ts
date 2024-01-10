import { SearchParams } from 'types/enums/searchParams'

export function getRoute(
  page: Page,
  searchParams: URLSearchParams,
  address?: string,
  accountId?: string | null,
) {
  let nextUrl = ''

  if (address) {
    nextUrl += `/wallets/${address}`
  }

  nextUrl += `/${page}`

  let url = new URL(nextUrl, 'https://app.marsprotocol.io')

  Array.from(searchParams?.entries() || []).map(([key, value]) =>
    url.searchParams.append(key, value),
  )

  if (accountId) {
    url.searchParams.delete(SearchParams.ACCOUNT_ID)
    url.searchParams.append(SearchParams.ACCOUNT_ID, accountId)
  }

  return url.pathname + url.search
}

export function getPage(pathname: string): Page {
  const pages: Page[] = [
    'execute',
    'trade',
    'trade-advanced',
    'perps',
    'borrow',
    'farm',
    'lend',
    'portfolio',
    'hls-farm',
    'hls-staking',
  ]
  const segments = pathname.split('/')

  const page = segments.find((segment) => pages.includes(segment as Page))

  if (page) {
    if (page === 'portfolio') {
      const path = pathname.split('portfolio')[1]
      return (page + path) as Page
    }
    return page as Page
  }

  return 'trade' as Page
}

export function getSearchParamsObject(searchParams: URLSearchParams) {
  const params: { [key: string]: string } = {}

  Array.from(searchParams?.entries() || []).forEach(([key, value]) => (params[key] = value))

  return params
}
