import { getAccountDebts } from 'utils/api'

interface Props {
  account: string
}

export async function AccountDebtTable(props: Props) {
  const debtData = await getAccountDebts(props.account)

  return debtData.map((debt) => {
    return (
      <p key={debt.denom}>
        {debt.denom} {debt.amount}
      </p>
    )
  })
}
