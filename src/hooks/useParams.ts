import { usePathname } from 'next/navigation'

export default function useParams() {
  const pathname = usePathname()
  const params = {
    wallet: '',
    account: '',
    page: '',
  }

  if (!pathname) return params

  const segments = pathname.split('/')

  segments.forEach((segment, index) => {
    if (segment === 'wallet' && segments[index + 1]) {
      params.wallet = segments[index + 1]
    } else if (segment === 'account' && segments[index + 1]) {
      params.account = segments[index + 1]
    } else if (index === 5) {
      params.page = segment
    }
  })

  return params
}
