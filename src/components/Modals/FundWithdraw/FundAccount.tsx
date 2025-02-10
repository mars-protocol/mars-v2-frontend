import AccountFundContent from 'components/account/AccountFund/AccountFundContent'
import useAccounts from 'hooks/accounts/useAccounts'
import useStore from 'store'

interface Props {
  account: Account
  onConnectWallet: () => Promise<boolean>
}

export default function FundAccount(props: Props) {
  const { account, onConnectWallet } = props

  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('default', address)
  const hasNoAccounts = accounts?.length < 1

  const accountId = account.id
  if (!address) return null

  return (
    <AccountFundContent
      account={account}
      address={address}
      accountId={accountId}
      onConnectWallet={onConnectWallet}
      hasExistingAccount={!hasNoAccounts}
    />
  )
}
