export function getRoute(page: Page, address?: string, accountId?: string | null) {
  let nextUrl = ''

  if (address) {
    nextUrl += `/wallets/${address}`
  }

  nextUrl += `/${page}`

  let url = new URL(nextUrl, 'https://app.marsprotocol.io')

  if (accountId) {
    url.searchParams.append('accountId', accountId)
  } else {
    url.searchParams.delete('accountId')
  }

  return url.pathname + url.search
}

export function getPage(pathname: string): Page {
  const pages: Page[] = ['trade', 'borrow', 'farm', 'lend', 'portfolio', 'hls-farm', 'hls-staking']
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
