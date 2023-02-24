import { BorrowTable } from 'components/BorrowTable'
import { AccountDebtTable } from 'components/AccountDebtTable'
import { Card } from 'components/Card'
import Loading from 'components/Loading'
import { Text } from 'components/Text'
import { Suspense } from 'react'

export default function page({ params }: { params: PageParams }) {
  return (
    <div className='flex w-full flex-col'>
      <Card className='mb-4'>
        <Text size='lg' uppercase>
          Debt data
        </Text>
        <Suspense fallback={<Loading className='h-full w-full' />}>
          {/* @ts-expect-error Server Component */}
          <AccountDebtTable account={params.account} />
        </Suspense>
      </Card>
      <Card>
        <Text size='lg' uppercase>
          Borrow data
        </Text>
        <Suspense fallback={<Loading className='h-full w-full' />}>
          {/* @ts-expect-error Server Component */}
          <BorrowTable />
        </Suspense>
      </Card>
    </div>
  )
}
