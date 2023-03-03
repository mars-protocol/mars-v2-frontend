import { BorrowTable } from 'components/Borrow/BorrowTable'
import { Card } from 'components/Card'
import { getAccountDebts, getBorrowData } from 'utils/api'
import { getMarketAssets } from 'utils/assets'

export default async function page({ params }: { params: PageParams }) {
  const debtData = await getAccountDebts(params.account)
  const borrowData = await getBorrowData()

  const marketAssets = getMarketAssets()

  const { available, active } = marketAssets.reduce(
    (prev: { available: BorrowAsset[]; active: BorrowAssetActive[] }, curr) => {
      const borrow = borrowData.find((borrow) => borrow.denom === curr.denom)
      if (borrow) {
        const debt = debtData.find((debt) => debt.denom === curr.denom)
        if (debt) {
          prev.active.push({
            ...borrow,
            debt: debt.amount,
          })
        } else {
          prev.available.push(borrow)
        }
      }
      return prev
    },
    { available: [], active: [] },
  )

  return (
    <div className='flex w-full flex-col'>
      {active.length > 0 && (
        <Card className='h-fit w-full' title='Borrowings'>
          <BorrowTable data={active} />
        </Card>
      )}
      {available.length > 0 && (
        <Card className='h-fit w-full' title='Available to borrow'>
          <BorrowTable data={available} />
        </Card>
      )}
    </div>
  )
}
