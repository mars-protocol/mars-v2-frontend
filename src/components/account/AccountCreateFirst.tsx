import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AccountFundContent from 'components/account/AccountFund/AccountFundContent'
import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import Card from 'components/common/Card'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import WalletSelect from 'components/Wallet/WalletSelect'
import useAccounts from 'hooks/accounts/useAccounts'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import { useWeb3WalletConnection } from 'hooks/wallet/useWeb3WalletConnections'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const createAccount = useStore((s) => s.createAccount)
  const [isCreating, setIsCreating] = useToggle(false)
  const [isAutoLendEnabled] = useEnableAutoLendGlobal()

  const { isLoading } = useAccounts('default', address)
  const currentAccount = useCurrentAccount()
  const { handleConnectWallet } = useWeb3WalletConnection()

  useEffect(() => {
    if (!address) useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [address])

  const handleClick = useCallback(async () => {
    setIsCreating(true)
    const accountId = await createAccount('default', isAutoLendEnabled)
    setIsCreating(false)
    if (accountId) {
      navigate(getRoute(getPage(pathname, chainConfig), searchParams, address, accountId))
      useStore.setState({
        focusComponent: {
          component: <AccountFundFullPage />,
          onClose: () => {
            useStore.setState({ getStartedModal: true })
          },
        },
      })
    }
  }, [
    setIsCreating,
    createAccount,
    navigate,
    pathname,
    searchParams,
    address,
    isAutoLendEnabled,
    chainConfig,
  ])

  if (!chainConfig.evmAssetSupport) {
    return (
      <FullOverlayContent
        title='Mint your account'
        copy="We'll require you to authorise a transaction in your wallet in order to begin."
        button={{
          className: 'mt-4 w-full',
          text: 'Approve transaction',
          color: 'tertiary',
          showProgressIndicator: isCreating,
          onClick: handleClick,
          size: 'lg',
        }}
        docs='account'
      />
    )
  }

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
            isCreateAccount
          />
        </Card>
      )}
    </FullOverlayContent>
  )
}
