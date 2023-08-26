import AccountSummary from 'components/Account/AccountSummary'
import useCurrentAccount from 'hooks/useCurrentAccount'

function CurrentAccountSummary() {
  const account = useCurrentAccount()
  if (!account) return
  return <AccountSummary account={account} />
}

export default CurrentAccountSummary
