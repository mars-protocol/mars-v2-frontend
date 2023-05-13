import { Suspense, use } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'components/Card'

import { getMarketAssets } from 'utils/assets'
import { BorrowTable } from 'components/Borrow/BorrowTable'
import useSWR from 'swr'
import getAccountDebts from 'api/accounts/getAccountDebts'
import getMarketBorrowings from 'api/markets/getMarketBorrowings'

interface Props {
  type: 'active' | 'available'
}

function Content(props: Props) {
  const params = useParams()
  const { data: debtData } = useSWR(params?.accountId || '', getAccountDebts, { suspense: true })
  const { data: borrowData } = useSWR('borrowdata', getMarketBorrowings, { suspense: true })

  const marketAssets = getMarketAssets()

  function getBorrowAssets() {
    return marketAssets.reduce(
      (prev: { available: BorrowAsset[]; active: BorrowAssetActive[] }, curr) => {
        const borrow = borrowData.find((borrow) => borrow.denom === curr.denom)
        if (borrow) {
          const debt = debtData?.find((debt) => debt.denom === curr.denom)
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

export function AvailableBorrowings() {
  return (
    <Card className='h-fit w-full bg-white/5' title={'Available to borrow'}>
      <Suspense fallback={<Fallback />}>
        <Content type='available' />
      </Suspense>
    </Card>
  )
}

export function ActiveBorrowings() {
  return (
    <Suspense fallback={null}>
      <Content type='active' />
    </Suspense>
  )
}
