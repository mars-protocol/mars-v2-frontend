import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from 'components/Button'
import Text from 'components/Text'
import WalletTutorial from 'components/Wallet/WalletTutorial'
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
    <div className='min-h-[600px] w-100'>
      <Text size='4xl' className='w-full pb-2 text-center'>
        Mint your account
      </Text>
      <Text size='sm' className='h-14 w-full text-center text-white/60'>
        We&apos;ll require you to authorise a transaction in your wallet in order to begin.
      </Text>
      <Button
        className='mt-4 w-full'
        text='Approve transaction'
        color='tertiary'
        showProgressIndicator={isCreating}
        onClick={handleClick}
        size='lg'
      />
      <WalletTutorial type='account' />
    </div>
  )
}
