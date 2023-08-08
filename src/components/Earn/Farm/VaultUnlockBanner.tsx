import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/Button'
import { ChevronRight } from 'components/Icons'
import NotificationBanner from 'components/NotificationBanner'
import useStore from 'store'

interface Props {
  vaults: DepositedVault[]
}

export default function VaultUnlockBanner(props: Props) {
  const { accountId } = useParams()
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)

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
