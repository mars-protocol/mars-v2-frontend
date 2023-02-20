import { Suspense } from 'react'

import CreditAccounts from 'app/portfolio/CreditAccounts'
import VaultsInfo from 'app/portfolio/VaultsInfo'
import { Card } from 'components/Card'

export default async function page() {
  return (
    <div className='flex w-full items-start gap-4'>
      <Suspense
        fallback={
          <Card className='flex-1 animate-pulse'>
            <></>
          </Card>
        }
      >
        {/* @ts-expect-error Server Component */}
        <CreditAccounts />
      </Suspense>
      <Suspense
        fallback={
          <Card className='flex-1 animate-pulse'>
            <></>
          </Card>
        }
      >
        {/* @ts-expect-error Server Component */}
        <VaultsInfo />
      </Suspense>
    </div>
  )
}
