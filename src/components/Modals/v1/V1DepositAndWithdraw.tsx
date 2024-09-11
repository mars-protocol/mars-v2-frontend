import useAccount from 'hooks/accounts/useAccount'
import useStore from 'store'
import Deposit from './Deposit'
import Withdraw from './Withdraw'

export default function V1DepositAndWithdraw() {
  const address = useStore((s) => s.address)
  const { data: account } = useAccount(address)
  const modal = useStore<V1DepositAndWithdrawModal | null>((s) => s.v1DepositAndWithdrawModal)
  const isDeposit = modal?.type === 'deposit'

  if (!modal || !account) return null
  if (isDeposit) return <Deposit account={account} />
  return <Withdraw account={account} />
}
