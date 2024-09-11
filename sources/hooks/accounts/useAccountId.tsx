import { useSearchParams } from 'react-router-dom'
import useStore from '../../store'

export default function useAccountId() {
  const [searchParams] = useSearchParams()
  const isV1 = useStore((s) => s.isV1)
  const address = useStore((s) => s.address)

  return isV1 ? address : searchParams.get('accountId')
}
