import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import FullOverlayContent from 'components/FullOverlayContent'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { hardcodedFee } from 'utils/constants'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const address = useStore((s) => s.address)
  const createAccount = useStore((s) => s.createAccount)
  const [isCreating, setIsCreating] = useToggle(false)

  const handleClick = useCallback(async () => {
    setIsCreating(true)
    const accountId = await createAccount({ fee: hardcodedFee })
    setIsCreating(false)
    // TODO: set focusComponent to fund account
    useStore.setState({ focusComponent: null })
    accountId && navigate(`/wallets/${address}/accounts/${accountId}`)
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
