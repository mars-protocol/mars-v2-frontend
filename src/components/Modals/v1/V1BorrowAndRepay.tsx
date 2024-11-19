import Borrow from 'components/Modals/v1/Borrow'
import Repay from 'components/Modals/v1/Repay'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'

export default function V1BorrowAndRepayModal() {
  const { data: account } = useV1Account()

  const modal = useStore<V1BorrowAndRepayModal | null>((s) => s.v1BorrowAndRepayModal)
  const isBorrow = modal?.type === 'borrow'

  if (!modal || !account) return null
  if (isBorrow) return <Borrow account={account} />
  return <Repay account={account} />
}
