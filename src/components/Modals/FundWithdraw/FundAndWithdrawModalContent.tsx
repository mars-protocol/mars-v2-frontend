import FundAccount from 'components/Modals/FundWithdraw/FundAccount'
import WithdrawFromAccount from 'components/Modals/FundWithdraw/WithdrawFromAccount'

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
