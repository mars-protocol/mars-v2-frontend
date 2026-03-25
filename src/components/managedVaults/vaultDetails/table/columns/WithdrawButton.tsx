export const WITHDRAW_META = {
  id: 'withdraw',
  header: 'Actions',
  meta: { className: 'min-w-30' },
}

interface Props {
  totalUnlockedAmount: string
  vaultAddress: string
  vaultTokenDenom: string
  disabled: boolean
}

export default function WithdrawButton(_props: Props) {
  return null
}
