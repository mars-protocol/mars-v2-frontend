import React, { Suspense, useMemo } from 'react'

import AccountBalancesTable from '../../account/AccountBalancesTable'
import useBorrowMarketAssetsTableData from '../../borrow/Table/useBorrowMarketAssetsTableData'
import Card from '../../common/Card'
import TableSkeleton from '../../common/Table/TableSkeleton'
import Text from '../../common/Text'
import useLendingMarketAssetsTableData from '../../earn/lend/Table/useLendingMarketAssetsTableData'

interface Props {
  isUsersAccount?: boolean
  account: Account
}

function Content(props: Props) {
  const { isUsersAccount, account } = props
  const data = useBorrowMarketAssetsTableData()
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
        isUsersAccount={isUsersAccount}
        showLiquidationPrice
        hideCard
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
      <Card className='w-full bg-white/5' contentClassName='overflow-x-scroll md:overflow-hidden'>
        {props.children ? (
          props.children
        ) : (
          <TableSkeleton
            labels={['Asset', 'Value', 'Size', 'Price', 'Liquidation Price', 'APY']}
            rowCount={3}
          />
        )}
      </Card>
    </div>
  )
}
