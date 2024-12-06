import { useCallback, useState } from 'react'

import Button from 'components/common/Button'
import { AccountArrowDown } from 'components/common/Icons'
import useAccountId from 'hooks/accounts/useAccountId'
import useSlippage from 'hooks/settings/useSlippage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'

export const WITHDRAW_META = { id: 'withdraw', header: 'Actions' }

interface Props {
  vault: DepositedVault
}

export function VaultWithdraw(props: Props) {
  const accountId = useAccountId()
  const [isConfirming, setIsConfirming] = useState(false)
  const [slippage] = useSlippage()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()

  const withdrawHandler = useCallback(async () => {
    if (!accountId) return
    setIsConfirming(true)
    if (props.vault.type === 'perp') {
      await useStore.getState().withdrawFromPerpsVault({
        accountId,
        isAutoLend: isAutoLendEnabledForCurrentAccount,
        vaultDenom: props.vault.denoms.primary,
      })
    } else {
      await useStore.getState().withdrawFromVaults({
        accountId: accountId,
        vaults: [props.vault],
        slippage,
      })
    }
    setIsConfirming(false)
  }, [accountId, isAutoLendEnabledForCurrentAccount, props.vault, slippage])

  return (
    <Button
      onClick={withdrawHandler}
      color='tertiary'
      leftIcon={<AccountArrowDown />}
      className='ml-auto'
      showProgressIndicator={isConfirming}
    >
      Withdraw
    </Button>
  )
}
