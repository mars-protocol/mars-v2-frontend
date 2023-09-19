import { useEffect, useState } from 'react'

import AccountFundContent from 'components/Account/AccountFund/AccountFundContent'
import Card from 'components/Card'
import { CircularProgress } from 'components/CircularProgress'
import FullOverlayContent from 'components/FullOverlayContent'
import useAccountId from 'hooks/useAccountId'
import useAccounts from 'hooks/useAccounts'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

export default function AccountFundFullPage() {
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  const { data: accounts, isLoading } = useAccounts(address)
  const currentAccount = useCurrentAccount()
  const [selectedAccountId, setSelectedAccountId] = useState<null | string>(null)

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
      {isLoading ? (
        <CircularProgress size={40} />
      ) : (
        <Card className='w-full p-6 bg-white/5'>
          <AccountFundContent
            account={currentAccount}
            address={address}
            accountId={selectedAccountId}
            isFullPage
          />
        </Card>
      )}
    </FullOverlayContent>
  )
}
