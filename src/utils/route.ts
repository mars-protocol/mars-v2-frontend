export function getRouteParams(url: string | null): PageParams {
  const segments = (url || location.href).split('/')

  const params = {
    wallet: '',
    account: '',
  }

  segments.forEach((segment, index) => {
    if (segment === 'wallet' && segments[index + 1]) {
      params.wallet = segments[index + 1]
    } else if (segment === 'account' && segments[index + 1]) {
      params.account = segments[index + 1]
    }
  })

  return params
}
