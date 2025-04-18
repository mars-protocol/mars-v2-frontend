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
  vaultTokenDenom: string
  disabled: boolean
}

export default function WithdrawButton(props: Props) {
  const { amount, vaultAddress, vaultTokenDenom, disabled } = props
  const address = useStore((s) => s.address)
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromManagedVault = useStore((s) => s.withdrawFromManagedVault)

  const handleWithdraw = useCallback(async () => {
    setIsConfirming(true)
    try {
      await withdrawFromManagedVault({
        vaultAddress,
        amount,
        vaultToken: vaultTokenDenom,
        recipient: address,
      })
    } catch (error) {
      console.error('Withdrawal failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }, [address, amount, vaultAddress, vaultTokenDenom, withdrawFromManagedVault])

  return (
    <Button
      onClick={handleWithdraw}
      color='tertiary'
      leftIcon={<AccountArrowDown />}
      className='ml-auto w-30'
      showProgressIndicator={isConfirming}
      disabled={disabled}
    >
      Withdraw
    </Button>
  )
}
