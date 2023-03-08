import { Suspense } from 'react'

import { Card } from 'components/Card'
import { getAccountDebts, getBorrowData } from 'utils/api'
import { getMarketAssets } from 'utils/assets'

import { BorrowTable } from './BorrowTable'

async function Content(props: Props) {
  const debtData = await getAccountDebts(props.params?.account)
  const borrowData = await getBorrowData()

  const marketAssets = getMarketAssets()

  function getBorrowAssets() {
    return marketAssets.reduce(
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
  }

  const { available, active } = getBorrowAssets()

  return <BorrowTable data={props.type === 'active' ? active : available} />
}

function Fallback() {
  const marketAssets = getMarketAssets()

  const available: BorrowAsset[] = marketAssets.reduce((prev: BorrowAsset[], curr) => {
    prev.push({ ...curr, borrowRate: null, liquidity: null })

    return prev
  }, [])

  return <BorrowTable data={available} />
}

export default function BorrowPage(props: Props) {
  return (
    <Card
      className='h-fit w-full'
      title={props.type === 'active' ? 'Borrowings' : 'Available to borrow'}
    >
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content params={props.params} type={props.type} />
      </Suspense>
    </Card>
  )
}

interface Props extends PageProps {
  type: 'active' | 'available'
}
