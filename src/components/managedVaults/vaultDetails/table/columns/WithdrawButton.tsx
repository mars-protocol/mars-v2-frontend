import Button from 'components/common/Button'
import { AccountArrowDown } from 'components/common/Icons'
import { useCallback, useState } from 'react'
import useStore from 'store'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import { BN } from 'utils/helpers'
import BigNumber from 'bignumber.js'

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
  console.log('### amount in withdraw button:', amount)

  const address = useStore((s) => s.address)
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromManagedVault = useStore((s) => s.withdrawFromManagedVault)
  const walletBalance = useCurrentWalletBalance(vaultTokenDenom)

  const handleWithdraw = useCallback(async () => {
    setIsConfirming(true)
    try {
      // Ensure the withdrawal amount never exceeds the user's wallet balance
      const walletBalanceAmount = BN(walletBalance?.amount || '0')
      console.log('### walletBalanceAmount:', walletBalanceAmount.toString())
      const requestedAmount = BN(amount)
      console.log('### requestedAmount:', requestedAmount.toString())
      const actualAmount = BigNumber.minimum(requestedAmount, walletBalanceAmount).toString()
      console.log('### actualAmount sent to contract:', actualAmount.toString())
      console.log('### vaultTokenDenom sent to contract:', vaultTokenDenom)

      await withdrawFromManagedVault({
        vaultAddress,
        amount: actualAmount,
        vaultToken: vaultTokenDenom,
        recipient: address,
      })
    } catch (error) {
      console.error('Withdrawal failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }, [
    address,
    amount,
    vaultAddress,
    vaultTokenDenom,
    withdrawFromManagedVault,
    walletBalance?.amount,
  ])

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
