import { Suspense } from 'react'

import Card from 'components/Card'
import { getAccountDebts, getBorrowData } from 'utils/api'
import { getMarketAssets } from 'utils/assets'
import { BorrowTable } from 'components/Borrow/BorrowTable'

interface Props extends PageProps {
  type: 'active' | 'available'
}

async function Content(props: Props) {
  const debtData = await getAccountDebts(props.params?.accountId)
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

  const assets = props.type === 'active' ? active : available

  if (!assets.length) return null

  if (props.type === 'active') {
    return (
      <Card
        className='h-fit w-full bg-white/5'
        title={props.type === 'active' ? 'Borrowings' : 'Available to borrow'}
      >
        <BorrowTable data={assets} />
      </Card>
    )
  }

  return <BorrowTable data={assets} />
}

function Fallback() {
  const marketAssets = getMarketAssets()

  const available: BorrowAsset[] = marketAssets.reduce((prev: BorrowAsset[], curr) => {
    prev.push({ ...curr, borrowRate: null, liquidity: null })

    return prev
  }, [])

  return <BorrowTable data={available} />
}

export function AvailableBorrowings(props: PageProps) {
  return (
    <Card className='h-fit w-full bg-white/5' title={'Available to borrow'}>
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content params={props.params} type='available' />
      </Suspense>
    </Card>
  )
}

export function ActiveBorrowings(props: PageProps) {
  return (
    <Suspense fallback={null}>
      {/* @ts-expect-error Server Component */}
      <Content params={props.params} type='active' />
    </Suspense>
  )
}
