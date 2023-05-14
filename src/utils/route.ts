export function getRoute(page: Page, address?: string, accountId?: string) {
  let nextUrl = ''

  if (address) {
    nextUrl += `/wallets/${address}`

    if (accountId) {
      nextUrl += `/accounts/${accountId}`
    }
  }

  return (nextUrl += `/${page}`)
}

export function getPage(pathname: string) {
  const pages: Page[] = ['trade', 'borrow', 'farm', 'lend', 'portfolio', 'council']
  const lastSegment = pathname.split('/').pop() as Page

  if (!lastSegment) return 'trade'

  if (pages.includes(lastSegment)) {
    return lastSegment
  }

  return 'trade'
}
