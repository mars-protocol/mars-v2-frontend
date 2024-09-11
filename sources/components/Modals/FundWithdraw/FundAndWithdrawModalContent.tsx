import FundAccount from './FundAccount'
import WithdrawFromAccount from './WithdrawFromAccount'

interface Props {
  account?: Account
  isFunding: boolean
}

export default function FundWithdrawModalContent(props: Props) {
  const { account, isFunding } = props
  if (!account) return null
  if (isFunding) return <FundAccount account={account} />
  return <WithdrawFromAccount account={account} />
}
