import { Row } from '@tanstack/react-table'
import moment from 'moment'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/Button'
import { AccountArrowDown, LockLocked, LockUnlocked, Plus } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'
import useStore from 'store'
import { VaultStatus } from 'types/enums/vault'
import { hardcodedFee } from 'utils/constants'

interface Props {
  row: Row<Vault | DepositedVault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function VaultExpanded(props: Props) {
  const vault = props.row.original as DepositedVault
  const { accountId } = useParams()
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)

  function depositMoreHandler() {
    useStore.setState({
      vaultModal: {
        vault: props.row.original,
        isDeposited: true,
        selectedBorrowDenoms: [props.row.original.denoms.secondary],
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
      fee: hardcodedFee,
      accountId: accountId,
      vaults,
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
      className='cursor-pointer bg-black/20 transition-colors'
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      <td colSpan={!status ? 5 : 6}>
        <div className='align-center flex justify-end gap-3 p-4'>
          {status && <DepositMoreButton />}
          {status === VaultStatus.ACTIVE && <UnlockButton />}
          {status === VaultStatus.UNLOCKING && <UnlockingButton />}
          {status === VaultStatus.UNLOCKED && <UnlockedButton />}
        </div>
      </td>
    </tr>
  )
}
