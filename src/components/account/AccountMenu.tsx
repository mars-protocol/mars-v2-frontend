import classNames from 'classnames'
import { Suspense } from 'react'

import Loading from 'components/common/Loading'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useStore from 'store'
import AccountMenuContent from './AccountMenuContent'

interface Props {
  className?: string
}

function Content(props: Props) {
  const address = useStore((s) => s.address)
  const { data: accountIds, isLoading } = useAccountIds(address)
  if (isLoading) return <Loading className={classNames('h-8 w-35', props.className)} />
  if (!accountIds) return null
  return <AccountMenuContent className={props.className} />
}

export default function AccountMenu(props: Props) {
  return (
    <Suspense fallback={<Loading className='h-8 w-35' />}>
      <Content className={props.className} />
    </Suspense>
  )
}
