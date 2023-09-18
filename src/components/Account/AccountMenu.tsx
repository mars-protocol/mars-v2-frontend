import { Suspense } from 'react'

import AccountMenuContent from 'components/Account/AccountMenuContent'
import Loading from 'components/Loading'
import useAccounts from 'hooks/useAccounts'
import useStore from 'store'

function Content() {
  const address = useStore((s) => s.address)
  const { data: accounts, isLoading } = useAccounts(address)

  if (isLoading) return <Loading className='h-8 w-35' />
  if (!accounts) return null
  return <AccountMenuContent accounts={accounts} />
}

export default function AccountMenu() {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      <Content />
    </Suspense>
  )
}
