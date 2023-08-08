import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import AccountFund from 'components/Account/AccountFund'
import FullOverlayContent from 'components/FullOverlayContent'
import WalletSelect from 'components/Wallet/WalletSelect'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { hardcodedFee } from 'utils/constants'
import { getPage, getRoute } from 'utils/route'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const createAccount = useStore((s) => s.createAccount)
  const [isCreating, setIsCreating] = useToggle(false)

  useEffect(() => {
    if (!address) useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [address])

  const handleClick = useCallback(async () => {
    setIsCreating(true)
    const accountId = await createAccount({ fee: hardcodedFee })
    setIsCreating(false)
    if (accountId) {
      navigate(getRoute(getPage(pathname), address, accountId))
      useStore.setState({
        focusComponent: {
          component: <AccountFund />,
          onClose: () => {
            useStore.setState({ getStartedModal: true })
          },
        },
      })
    }
  }, [createAccount, navigate, pathname, address, setIsCreating])

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
