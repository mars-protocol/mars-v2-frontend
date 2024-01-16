import { Suspense } from 'react'

import AccountMenuContent from 'components/account/AccountMenuContent'
import Loading from 'components/common/Loading'
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
