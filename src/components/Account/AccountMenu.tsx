import { Suspense } from 'react'

import AccountMenuContent from 'components/Account/AccountMenuContent'
import Loading from 'components/Loading'
import { getAccounts } from 'utils/api'

async function getAccountsData(address: string) {
  return getAccounts(address)
}

async function Content(props: { params: PageParams }) {
  const accounts = await getAccountsData(props.params.address)
  return <AccountMenuContent accounts={accounts} />
}

export default function AccountMenu(props: { params: PageParams }) {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      {/* @ts-expect-error Server Component */}
      <Content params={props.params} />
    </Suspense>
  )
}
