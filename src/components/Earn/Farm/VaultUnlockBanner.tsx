import { useState } from 'react'

import Button from 'components/Button'
import { ChevronRight } from 'components/Icons'
import NotificationBanner from 'components/NotificationBanner'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'

interface Props {
  vaults: DepositedVault[]
}

export default function VaultUnlockBanner(props: Props) {
  const accountId = useAccountId()
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)

  async function handleWithdraw() {
    if (!accountId) return
    if (props.vaults.length > 1) {
      useStore.setState({
        withdrawFromVaultsModal: props.vaults,
      })
    } else {
      setIsConfirming(true)
      await withdrawFromVaults({
        accountId: accountId,
        vaults: props.vaults,
        slippage,
      })
      setIsConfirming(false)
    }
  }

  if (props.vaults.length === 0) return null

  return (
    <NotificationBanner
      type='success'
      text={
        props.vaults.length === 1
          ? 'There is one vault with funds unlocked. It is not earning fees and can be liquidated'
          : `There are ${props.vaults.length} vaults with funds unlocked. They are not earning fees and can be liquidated.`
      }
      button={
        <Button
          onClick={handleWithdraw}
          variant='transparent'
          color='quaternary'
          className='!text-success underline hover:no-underline'
          text='Withdraw Unlocked Positions'
          rightIcon={<ChevronRight />}
          iconClassName='text-success w-2 h-4'
          showProgressIndicator={isConfirming}
        />
      }
    />
  )
}
