import { Suspense } from 'react'

import AccountMenuContent from 'components/Account/AccountMenuContent'
import Loading from 'components/Loading'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useStore from 'store'

function Content() {
  const address = useStore((s) => s.address)
  const { data: accountIds, isLoading } = useAccountIds(address)
  if (isLoading) return <Loading className='h-8 w-35' />
  if (!accountIds) return null
  return <AccountMenuContent />
}

export default function AccountMenu() {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      <Content />
    </Suspense>
  )
}
