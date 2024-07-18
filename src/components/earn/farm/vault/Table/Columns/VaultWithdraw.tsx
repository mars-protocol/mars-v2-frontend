import { useCallback, useState } from 'react'
import { useSWRConfig } from 'swr'

import Button from 'components/common/Button'
import { AccountArrowDown } from 'components/common/Icons'
import useSlippage from 'hooks/settings/useSlippage'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'

export const WITHDRAW_META = { id: 'withdraw', header: 'Actions' }

interface Props {
  vault: DepositedVault
}

export function VaultWithdraw(props: Props) {
  const accountId = useAccountId()
  const [isConfirming, setIsConfirming] = useState(false)
  const [slippage] = useSlippage()
  const { mutate } = useSWRConfig()
  const chainConfig = useChainConfig()

  const withdrawHandler = useCallback(async () => {
    if (!accountId) return
    setIsConfirming(true)
    if (props.vault.type === 'perp') {
      await useStore.getState().withdrawFromPerpsVault({ accountId })
    } else {
      await useStore.getState().withdrawFromVaults({
        accountId: accountId,
        vaults: [props.vault],
        slippage,
      })
    }
    await mutate(`chains/${chainConfig.id}/accounts/${accountId}`)
    await mutate(`chains/${chainConfig.id}/vaults/${accountId}/deposited`)
    setIsConfirming(false)
  }, [accountId, chainConfig.id, mutate, props.vault, slippage])

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
