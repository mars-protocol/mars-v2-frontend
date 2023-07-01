import { useState } from 'react'

import Button from 'components/Button'
import { ChevronRight } from 'components/Icons'
import NotificationBanner from 'components/NotificationBanner'
import useStore from 'store'

interface Props {
  vaults: DepositedVault[]
}

export default function VaultUnlockBanner(props: Props) {
  const [isWaiting, setIsWaiting] = useState(false)

  async function handleWithdraw() {
    setIsWaiting(true)
    if (props.vaults.length > 1) {
      useStore.setState({
        vaultWithdrawModal: props.vaults,
      })
    } else {
      console.log('Withdraw')
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
          showProgressIndicator={isWaiting}
        />
      }
    />
  )
}
