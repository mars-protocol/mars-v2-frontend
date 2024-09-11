import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import FullOverlayContent from 'components/common/FullOverlayContent'
import useToggle from 'hooks/common/useToggle'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'
import WalletSelect from 'Wallet/WalletSelect'
import AccountFundFullPage from './AccountFund/AccountFundFullPage'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
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
      navigate(getRoute(getPage(pathname), searchParams, address, accountId))
      useStore.setState({
        focusComponent: {
          component: <AccountFundFullPage />,
          onClose: () => {
            useStore.setState({ getStartedModal: true })
          },
        },
      })
    }
  }, [setIsCreating, createAccount, isAutoLendEnabled, navigate, pathname, searchParams, address])

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
