import useCurrentAccount from 'hooks/useCurrentAccount'
import AccountSummary from 'components/Account/AccountSummary'

function CurrentAccountSummary({ change }: { change?: AccountChange }) {
  const account = useCurrentAccount()

  return <AccountSummary account={account} change={change} />
}

export default CurrentAccountSummary
