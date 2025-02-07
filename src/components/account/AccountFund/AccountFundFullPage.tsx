import { useEffect, useState } from 'react'

import AccountFundContent from 'components/account/AccountFund/AccountFundContent'
import Card from 'components/common/Card'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import useAccounts from 'hooks/accounts/useAccounts'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import useStore from 'store'
import { useWeb3WalletConnection } from 'hooks/wallet/useWeb3WalletConnections'

interface Props {
  isCreateAccount?: boolean
}

export default function AccountFundFullPage({ isCreateAccount = false }: Props) {
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  const { data: accounts, isLoading } = useAccounts('default', address)
  const currentAccount = useCurrentAccount()
  const [selectedAccountId, setSelectedAccountId] = useState<null | string>(null)

  const hasNoAccounts = accounts?.length < 1

  const { handleConnectWallet } = useWeb3WalletConnection()
  useEffect(() => {
    if (accounts && !selectedAccountId && accountId) setSelectedAccountId(accountId)
    if (accountId && selectedAccountId !== accountId) setSelectedAccountId(accountId)
  }, [accounts, selectedAccountId, accountId, currentAccount])

  const title =
    isCreateAccount || hasNoAccounts
      ? 'Create and Fund a Credit Account'
      : `Fund Credit Account ${selectedAccountId ? `#${selectedAccountId}` : ''}`

  if (!address) {
    return (
      <FullOverlayContent
        title='Connect Your Wallet'
        copy='Please connect your wallet to create and fund your account.'
        docs='fund'
      />
    )
  }

  return (
    <FullOverlayContent
      title={title}
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
            accountId={selectedAccountId ?? ''}
            isFullPage
            onConnectWallet={handleConnectWallet}
            hasExistingAccount={!isCreateAccount && !hasNoAccounts}
          />
        </Card>
      )}
    </FullOverlayContent>
  )
}
