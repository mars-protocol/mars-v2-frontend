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
