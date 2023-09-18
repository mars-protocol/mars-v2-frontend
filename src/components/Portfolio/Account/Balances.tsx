import React, { Suspense } from 'react'

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
  const { data: account } = useAccount(props.accountId, true)

  const { availableAssets: borrowAvailableAssets, accountBorrowedAssets } =
    useBorrowMarketAssetsTableData()
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()

  if (!account || !borrowAvailableAssets.length || !lendingAvailableAssets.length) {
    return <Skeleton />
  }

  return (
    <Skeleton>
      <AccountBalancesTable
        account={account}
        borrowingData={borrowAvailableAssets}
        lendingData={lendingAvailableAssets}
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
    <div>
      <Text size='2xl' className='mb-8'>
        Balances
      </Text>
      <Card className='mb-4 h-fit w-full bg-white/5'>
        {props.children ? (
          props.children
        ) : (
          <TableSkeleton labels={['Asset', 'Value', 'Size', 'APY']} rowCount={3} />
        )}
      </Card>
    </div>
  )
}
