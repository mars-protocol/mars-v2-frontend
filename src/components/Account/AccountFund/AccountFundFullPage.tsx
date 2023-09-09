import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import AccountFundContent from 'components/Account/AccountFund/AccountFundContent'
import Card from 'components/Card'
import FullOverlayContent from 'components/FullOverlayContent'
import useAccounts from 'hooks/useAccounts'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

export default function AccountFundFullPage() {
  const address = useStore((s) => s.address)
  const { accountId } = useParams()

  const { data: accounts } = useAccounts(address)
  const currentAccount = useCurrentAccount()
  const [selectedAccountId, setSelectedAccountId] = useState<null | string>(null)

  console.log('selectedAccountId', selectedAccountId)
  console.log('accountId', accountId)
  useEffect(() => {
    if (accounts && !selectedAccountId && accountId) setSelectedAccountId(accountId)
    if (accountId && selectedAccountId !== accountId) setSelectedAccountId(accountId)
  }, [accounts, selectedAccountId, accountId, currentAccount])

  if (!selectedAccountId || !address) return null

  return (
    <FullOverlayContent
      title={`Fund Credit Account #${selectedAccountId}`}
      copy='In order to start using this account, you need to deposit funds.'
      docs='fund'
    >
      <Card className='w-full p-6 bg-white/5'>
        <AccountFundContent
          account={currentAccount}
          address={address}
          accountId={selectedAccountId}
          isFullPage
        />
      </Card>
    </FullOverlayContent>
  )
}
