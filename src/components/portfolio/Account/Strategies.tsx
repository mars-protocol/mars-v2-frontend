import React, { Suspense } from 'react'

import AccountStrategiesTable from 'components/account/AccountStrategiesTable'
import Card from 'components/common/Card'
import TableSkeleton from 'components/common/Table/TableSkeleton'
import Text from 'components/common/Text'
import useAccount from 'hooks/accounts/useAccount'

interface Props {
  accountId: string
}

function Content(props: Props) {
  const { data: account } = useAccount(props.accountId, true)

  if (!account || account?.vaults.length === 0) {
    return null
  }

  return (
    <Skeleton>
      <AccountStrategiesTable account={account} hideCard />
    </Skeleton>
  )
}

export default function Strategies(props: Props) {
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
      <Text size='2xl'>Strategies</Text>
      <Card className='w-full bg-white/5'>
        {props.children ? (
          props.children
        ) : (
          <TableSkeleton labels={['Strategy & Value', 'Size', 'APY']} rowCount={1} />
        )}
      </Card>
    </div>
  )
}
