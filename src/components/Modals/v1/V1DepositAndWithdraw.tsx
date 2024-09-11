import Deposit from 'components/Modals/v1/Deposit'
import Withdraw from 'components/Modals/v1/Withdraw'
import useAccount from 'hooks/accounts/useAccount'
import useStore from 'store'

export default function V1DepositAndWithdraw() {
  const address = useStore((s) => s.address)
  const { data: account } = useAccount(address)
  const modal = useStore<V1DepositAndWithdrawModal | null>((s) => s.v1DepositAndWithdrawModal)
  const isDeposit = modal?.type === 'deposit'

  if (!modal || !account) return null
  if (isDeposit) return <Deposit account={account} />
  return <Withdraw account={account} />
}
