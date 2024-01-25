import AccountSummary from 'components/account/AccountSummary'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

function CurrentAccountSummary() {
  const account = useCurrentAccount()
  if (!account) return
  return <AccountSummary account={account} />
}

export default CurrentAccountSummary