import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AccountFundContent from 'components/account/AccountFund/AccountFundContent'
import Card from 'components/common/Card'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import WalletSelect from 'components/Wallet/WalletSelect'
import useStore from 'store'
import useAccounts from 'hooks/accounts/useAccounts'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import { useWeb3WalletConnection } from 'hooks/wallet/useWeb3WalletConnections'
import useWalletBalances from 'hooks/wallet/useWalletBalances'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  const { data: accounts, isLoading } = useAccounts('default', address)
  const currentAccount = useCurrentAccount()
  const { data: walletBalances } = useWalletBalances(address ?? '')
  const { handleConnectWallet } = useWeb3WalletConnection()

  useEffect(() => {
    if (!address) useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [address])

  const hasExistingAccount = accounts && accounts.length > 0

  return (
    <FullOverlayContent
      title={'Create and Fund a Credit Account'}
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
            accountId=''
            isFullPage
            onConnectWallet={handleConnectWallet}
            hasExistingAccount={hasExistingAccount}
          />
        </Card>
      )}
    </FullOverlayContent>
  )
}
