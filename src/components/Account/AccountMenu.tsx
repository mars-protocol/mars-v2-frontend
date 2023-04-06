import { Suspense } from 'react'

import AccountMenuContent from 'components/Account/AccountMenuContent'
import Loading from 'components/Loading'
import { getAccounts } from 'utils/api'

interface Props {
  params: PageParams
}

async function Content(props: Props) {
  const accounts = await getAccounts(props.params.address)
  return <AccountMenuContent accounts={accounts} />
}

export default function AccountMenu(props: Props) {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      {/* @ts-expect-error Server Component */}
      <Content params={props.params} />
    </Suspense>
  )
}
