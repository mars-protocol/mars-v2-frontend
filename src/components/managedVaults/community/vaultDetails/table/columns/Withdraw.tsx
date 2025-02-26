import Button from 'components/common/Button'
import { AccountArrowDown } from 'components/common/Icons'
import { useCallback, useState } from 'react'
import useStore from 'store'

export const WITHDRAW_META = {
  id: 'withdraw',
  header: 'Actions',
  meta: { className: 'min-w-30' },
}

interface Props {
  amount: string
  vaultAddress: string
  vaultToken: string
  unlocksAt: number
}

export default function Withdraw(props: Props) {
  const { amount, vaultAddress, vaultToken, unlocksAt } = props
  const address = useStore((s) => s.address)
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromManagedVault = useStore((s) => s.withdrawFromManagedVault)

  const timeLeft = unlocksAt ? unlocksAt - Date.now() : 0
  const isUnlocked = timeLeft <= 0

  const handleWithdraw = useCallback(async () => {
    setIsConfirming(true)
    try {
      await withdrawFromManagedVault({
        vaultAddress,
        amount,
        vaultToken,
        recipient: address,
      })
    } catch (error) {
      console.error('Withdrawal failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }, [address, amount, vaultAddress, vaultToken, withdrawFromManagedVault])

  return (
    <Button
      onClick={handleWithdraw}
      color='tertiary'
      leftIcon={<AccountArrowDown />}
      className='ml-auto'
      showProgressIndicator={isConfirming}
      disabled={!isUnlocked}
    >
      Withdraw
    </Button>
  )
}
