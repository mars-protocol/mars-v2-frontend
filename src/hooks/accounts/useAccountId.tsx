import { useSearchParams } from 'react-router-dom'

export default function useAccountId() {
  const [searchParams] = useSearchParams()
  return searchParams.get('accountId')
}
