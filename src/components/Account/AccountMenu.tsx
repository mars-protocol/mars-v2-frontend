import { Suspense } from 'react'

import AccountMenuContent from 'components/Account/AccountMenuContent'
import Loading from 'components/Loading'
import { getAccounts } from 'utils/api'

interface Props {
  params: PageParams
}

// TODO: fix the content and data below
function Content(props: Props) {
  if (props.params.address === undefined) return null
  const accounts = getAccounts(props.params.address)
  return <AccountMenuContent accounts={[]} />
}

export default function AccountMenu(props: Props) {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      <Content params={props.params} />
    </Suspense>
  )
}
