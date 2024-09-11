import { useEffect, useState } from 'react'

import useAccountId from '../../../hooks/accounts/useAccountId'
import useAccounts from '../../../hooks/accounts/useAccounts'
import useCurrentAccount from '../../../hooks/accounts/useCurrentAccount'
import useStore from '../../../store'
import Card from '../../common/Card'
import { CircularProgress } from '../../common/CircularProgress'
import FullOverlayContent from '../../common/FullOverlayContent'
import AccountFundContent from './AccountFundContent'

export default function AccountFundFullPage() {
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  const { data: accounts, isLoading } = useAccounts('default', address)
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
