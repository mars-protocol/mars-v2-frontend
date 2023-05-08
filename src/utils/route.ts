import { usePathname } from 'next/navigation'

export default function useParams() {
  const pathname = usePathname()
  return getParamsFromUrl(pathname ?? '')
}

export function getRouteParams(url: string | null): PageParams {
  const href = typeof location !== 'undefined' ? location.href : ''

  return getParamsFromUrl(url || href)
}

export function getParamsFromUrl(url: string) {
  const segments = url.split('/')

  const params: PageParams = {
    address: '',
    accountId: '',
    page: 'trade',
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
        if ([3, 5, 7].includes(index)) {
          if (segment === 'earn') {
            params.page = `${segment}/${segments[index + 1]}`
            break
          }
          params.page = segment
        }
    }
  })

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
