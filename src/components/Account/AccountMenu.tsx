import { Suspense } from 'react'

import AccountMenuContent from 'components/Account/AccountMenuContent'
import Loading from 'components/Loading'

interface Props {
  params: PageParams
}

// TODO: fix the content and data below
function Content(props: Props) {
  if (props.params.address === undefined) return null
  return <AccountMenuContent accounts={[]} />
}

export default function AccountMenu(props: Props) {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      <Content params={props.params} />
    </Suspense>
  )
}
