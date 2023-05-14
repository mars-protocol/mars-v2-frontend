export function getRoute(page: Page, address?: string, accountId?: string) {
  let nextUrl = ''

  if (address) {
    nextUrl += `/wallets/${address}`

    if (accountId) {
      nextUrl += `/accounts/${accountId}`
    }
  }

  return (nextUrl += `/${page}`)

  // const address = overrides?.address
  //   ? overrides.address
  //   : params.address
  //   ? params.address
  //   : undefined
  // const accountId = overrides?.accountId
  //   ? overrides.accountId
  //   : params.accountId
  //   ? params.accountId
  //   : undefined
  // const page = overrides?.page ? overrides.page : params.page ? params.page : 'trade'

  // if (address) {
  //   nextUrl += `/wallets/${address}`

  //   if (accountId) {
  //     nextUrl += `/accounts/${accountId}`
  //   }
  // }

  // nextUrl += `/${page}`
  return nextUrl
}

// export function navigateToPage(href: string, page: RouteSegment) {
//   const segments = location.pathname.split('/')
//   segments.pop()
//   segments.push(page)
//   return segments.join('/')
// }
