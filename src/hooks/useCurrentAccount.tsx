import { useParams } from 'react-router-dom'
import useStore from 'store'

export default function useCurrentAccount(): Account | undefined {
  const { accountId } = useParams()
  const accounts = useStore((s) => s.accounts)
  return accounts?.find((account) => account.id === accountId)
}
