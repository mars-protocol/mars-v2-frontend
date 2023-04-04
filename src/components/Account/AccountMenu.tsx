import { Suspense } from 'react'

import Loading from 'components/Loading'
import { getAccounts } from 'utils/api'
import AccountMenuContent from 'components/Account/AccountMenuContent'

async function getAccountsData(props: PageProps) {
  return getAccounts(props.params.address)
}

async function Content(props: PageProps) {
  const accounts = await getAccountsData(props)

  return <AccountMenuContent accounts={accounts} />
}

export default function AccountMenu(props: PageProps) {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      {/* @ts-expect-error Server Component */}
      <Content props={props} />
    </Suspense>
  )
}
