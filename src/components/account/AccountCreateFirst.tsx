import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import FullOverlayContent from 'components/common/FullOverlayContent'
import WalletSelect from 'components/Wallet/WalletSelect'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const createAccount = useStore((s) => s.createAccount)
  const [isCreating, setIsCreating] = useToggle(false)
  const [searchParams] = useSearchParams()
  const [isAutoLendEnabled] = useEnableAutoLendGlobal()

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
            // TODO: update docs to reflect the current state of v2
            //useStore.setState({ getStartedModal: true })
          },
        },
      })
    }
  }, [
    setIsCreating,
    createAccount,
    isAutoLendEnabled,
    navigate,
    pathname,
    chainConfig,
    searchParams,
    address,
  ])

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
