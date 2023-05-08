import useStore from 'store'
import useParams from 'utils/route'

export default function useCurrentAccount(): Account | undefined {
  const params = useParams()
  const accounts = useStore((s) => s.accounts)
  return accounts?.find((account) => account.id === params.accountId)
}
