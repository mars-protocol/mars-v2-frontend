import AccountFundContent from 'components/Account/AccountFund/AccountFundContent'
import useStore from 'store'

interface Props {
  account: Account
  handleChange: () => void
}

export default function FundAccount(props: Props) {
  const { account, handleChange } = props

  const address = useStore((s) => s.address)
  const accountId = account.id
  if (!address) return null

  return (
    <AccountFundContent
      account={account}
      address={address}
      accountId={accountId}
      handleChange={handleChange}
    />
  )
}
