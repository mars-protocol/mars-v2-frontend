import getAccountDebts from 'api/accounts/getAccountDebts'

interface Props {
  accountId: string
}

export async function AccountDebtTable(props: Props) {
  const debtData = await getAccountDebts(props.accountId)

  return debtData.map((debt) => {
    return (
      <p key={debt.denom}>
        {debt.denom} {debt.amount}
      </p>
    )
  })
}
