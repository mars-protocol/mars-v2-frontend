import { getBorrowData } from 'utils/api'

export async function BorrowTable() {
  const borrowData = await getBorrowData()

  return borrowData.map((borrow) => {
    return (
      <p key={borrow.denom}>
        {borrow.denom} {borrow.borrowRate} {borrow.marketLiquidity}
      </p>
    )
  })
}
