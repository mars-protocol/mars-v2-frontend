import Borrow from 'components/Modals/v1/Borrow'
import Repay from 'components/Modals/v1/Repay'
import useAccount from 'hooks/accounts/useAccount'
import useStore from 'store'

export default function V1BorrowAndRepayModal() {
  const address = useStore((s) => s.address)
  const { data: account } = useAccount(address)
  const modal = useStore<V1BorrowAndRepayModal | null>((s) => s.v1BorrowAndRepayModal)
  const isBorrow = modal?.type === 'borrow'

  if (!modal || !account) return null
  if (isBorrow) return <Borrow account={account} />
  return <Repay account={account} />
}
