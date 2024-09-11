import useAccount from 'hooks/accounts/useAccount'
import useStore from 'store'
import Borrow from './Borrow'
import Repay from './Repay'

export default function V1BorrowAndRepayModal() {
  const address = useStore((s) => s.address)
  const { data: account } = useAccount(address)
  const modal = useStore<V1BorrowAndRepayModal | null>((s) => s.v1BorrowAndRepayModal)
  const isBorrow = modal?.type === 'borrow'

  if (!modal || !account) return null
  if (isBorrow) return <Borrow account={account} />
  return <Repay account={account} />
}
