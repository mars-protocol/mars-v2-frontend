import AccountSummary from 'components/Account/AccountSummary'
import useCurrentAccount from 'hooks/useCurrentAccount'

function CurrentAccountSummary({ updatedAccount }: { updatedAccount?: Account }) {
  const account = useCurrentAccount()
  if (!account) return
  return <AccountSummary account={account} updatedAccount={updatedAccount} />
}

export default CurrentAccountSummary
