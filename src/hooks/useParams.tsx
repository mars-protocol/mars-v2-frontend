import { usePathname } from 'next/navigation'

export default function useParams() {
  const pathname = usePathname()
  const params = {
    address: '',
    accountId: '',
    page: '',
  }

  if (!pathname) return params

  const segments = pathname.split('/')

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
