import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import AccountFundFirst from 'components/Account/AccountFund'
import FullOverlayContent from 'components/FullOverlayContent'
import WalletSelect from 'components/Wallet/WalletSelect'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { hardcodedFee } from 'utils/constants'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const address = useStore((s) => s.address)
  const createAccount = useStore((s) => s.createAccount)
  const [isCreating, setIsCreating] = useToggle(false)

  useEffect(() => {
    if (!address) useStore.setState({ focusComponent: <WalletSelect /> })
  }, [address])

  const handleClick = useCallback(async () => {
    setIsCreating(true)
    const accountId = await createAccount({ fee: hardcodedFee })
    setIsCreating(false)
    if (accountId) {
      navigate(`/wallets/${address}/accounts/${accountId}/trade`)
      useStore.setState({ focusComponent: <AccountFundFirst /> })
    }
  }, [address, createAccount, navigate, setIsCreating])

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
