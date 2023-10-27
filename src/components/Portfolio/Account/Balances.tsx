import React, { Suspense, useMemo } from 'react'

import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import Card from 'components/Card'
import TableSkeleton from 'components/TableSkeleton'
import Text from 'components/Text'
import useAccount from 'hooks/useAccount'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'

interface Props {
  accountId: string
}

function Content(props: Props) {
  const { data: account } = useAccount('high_levered_strategy', props.accountId, true)

  const { data } = useBorrowMarketAssetsTableData(false)
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()

  if (!account || !borrowAssets.length || !lendingAssets.length) {
    return <Skeleton />
  }

  return (
    <Skeleton>
      <AccountBalancesTable
        account={account}
        borrowingData={borrowAssets}
        lendingData={lendingAssets}
      />
    </Skeleton>
  )
}

export default function Balances(props: Props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content {...props} />
    </Suspense>
  )
}

interface SkeletonProps {
  children?: React.ReactNode
}

function Skeleton(props: SkeletonProps) {
  return (
    <div className='flex flex-wrap w-full gap-4'>
      <Text size='2xl'>Balances</Text>
      <Card className='w-full bg-white/5'>
        {props.children ? (
          props.children
        ) : (
          <TableSkeleton labels={['Asset', 'Value', 'Size', 'APY']} rowCount={3} />
        )}
      </Card>
    </div>
  )
}
