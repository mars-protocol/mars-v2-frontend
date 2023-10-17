import { Row } from '@tanstack/react-table'
import moment from 'moment'
import { useState } from 'react'

import Button from 'components/Button'
import { AccountArrowDown, LockLocked, LockUnlocked, Plus } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { SLIPPAGE_KEY } from 'constants/localStore'
import useAccountId from 'hooks/useAccountId'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import { VaultStatus } from 'types/enums/vault'

interface Props {
  row: Row<DepositedVault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function VaultExpanded(props: Props) {
  const vault = props.row.original
  const accountId = useAccountId()
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const [slippage] = useLocalStorage<number>(SLIPPAGE_KEY, DEFAULT_SETTINGS.slippage)

  function depositMoreHandler() {
    useStore.setState({
      vaultModal: {
        vault: props.row.original,
        isDeposited: true,
        selectedBorrowDenoms: [props.row.original.denoms.secondary],
        isCreate: false,
      },
    })
  }

  function unlockHandler() {
    useStore.setState({ unlockModal: { vault } })
  }

  async function withdrawHandler() {
    if (!accountId) return
    const vaults = [props.row.original as DepositedVault]
    setIsConfirming(true)
    await withdrawFromVaults({
      accountId: accountId,
      vaults,
      slippage,
    })
  }

  const status = vault.status

  /* BUTTONS */

  function DepositMoreButton() {
    return (
      <Button onClick={depositMoreHandler} color='secondary' leftIcon={<Plus className='w-3' />}>
        Deposit more
      </Button>
    )
  }

  function UnlockButton() {
    return (
      <Tooltip
        type='info'
        content='In order to withdraw this position, you must first unlock it. This will unlock all the funds within this position.'
      >
        <Button onClick={unlockHandler} color='tertiary' leftIcon={<LockUnlocked />}>
          Unlock to withdraw
        </Button>
      </Tooltip>
    )
  }

  function UnlockingButton() {
    return (
      <Button
        onClick={withdrawHandler}
        color='tertiary'
        showProgressIndicator={isConfirming}
        disabled={true}
        leftIcon={<LockLocked />}
      >
        {`Withdraw in ${moment(vault?.unlocksAt).fromNow(true)}`}
      </Button>
    )
  }

  function UnlockedButton() {
    return (
      <Button
        onClick={withdrawHandler}
        color='tertiary'
        showProgressIndicator={isConfirming}
        leftIcon={<AccountArrowDown />}
      >
        Withdraw funds
      </Button>
    )
  }

  return (
    <tr
      key={props.row.id}
      className='hover:cursor-pointer bg-black/20 transition-colors'
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      <td colSpan={!status ? 7 : 8}>
        <div className='flex justify-end gap-3 p-4 align-center'>
          {status && <DepositMoreButton />}
          {status === VaultStatus.ACTIVE && <UnlockButton />}
          {status === VaultStatus.UNLOCKING && <UnlockingButton />}
          {status === VaultStatus.UNLOCKED && <UnlockedButton />}
        </div>
      </td>
    </tr>
  )
}
