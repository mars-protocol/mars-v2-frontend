import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/Button'
import { ChevronRight } from 'components/Icons'
import NotificationBanner from 'components/NotificationBanner'
import useStore from 'store'
import { hardcodedFee } from 'utils/constants'

interface Props {
  vaults: DepositedVault[]
}

export default function VaultUnlockBanner(props: Props) {
  const { accountId } = useParams()
  const [isWaiting, setIsWaiting] = useState(false)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)

  async function handleWithdraw() {
    if (!accountId) return
    setIsWaiting(true)
    if (props.vaults.length > 1) {
      useStore.setState({
        vaultWithdrawModal: props.vaults,
      })
    } else {
      await withdrawFromVaults({
        fee: hardcodedFee,
        accountId: accountId,
        vaults: props.vaults,
      })
      setIsWaiting(false)
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
