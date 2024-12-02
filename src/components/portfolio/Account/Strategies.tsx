import React, { Suspense } from 'react'

import AccountStrategiesTable from 'components/account/AccountStrategiesTable'
import Card from 'components/common/Card'
import TableSkeleton from 'components/common/Table/TableSkeleton'
import Text from 'components/common/Text'

interface Props {
  account: Account
}

function Content(props: Props) {
  const { account } = props

  if (account.vaults.length === 0 && account.stakedAstroLps.length === 0 && !account.perpsVault) {
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
