import React, { Suspense } from 'react'

import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import Card from 'components/common/Card'
import TableSkeleton from 'components/common/Table/TableSkeleton'
import Text from 'components/common/Text'
import useAccount from 'hooks/accounts/useAccount'

interface Props {
  accountId: string
}

function Content(props: Props) {
  const { data: account } = useAccount(props.accountId, true)

  if (!account) {
    return <Skeleton />
  }

  if (account.perps.length === 0) return null

  return (
    <Skeleton>
      <AccountPerpPositionTable account={account} showLiquidationPrice hideCard />
    </Skeleton>
  )
}

export default function PerpPositions(props: Props) {
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
      <Text size='2xl'>Perp Positions</Text>
      <Card className='w-full bg-white/5'>
        {props.children ? (
          props.children
        ) : (
          <TableSkeleton labels={['Asset', 'Value', 'Liq. Price', 'Total PnL']} rowCount={3} />
        )}
      </Card>
    </div>
  )
}
