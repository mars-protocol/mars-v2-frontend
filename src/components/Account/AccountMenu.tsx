import { Suspense } from 'react'
import useSWR from 'swr'

import AccountMenuContent from 'components/Account/AccountMenuContent'
import Loading from 'components/Loading'
import getWalletAccounts from 'api/wallets/getWalletAccounts'
import useStore from 'store'

function Content() {
  const address = useStore((s) => s.address)
  const { data: accounts } = useSWR(address, getWalletAccounts, { suspense: true })
  console.log(accounts)
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
