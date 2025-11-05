import { Row } from '@tanstack/react-table'
import dayjs from 'utils/dayjs'
import { useCallback, useMemo, useState } from 'react'

import { VaultStatus } from 'types/enums'
import Button from 'components/common/Button'
import { AccountArrowDown, LockLocked, LockUnlocked, Plus } from 'components/common/Icons'
import { Tooltip } from 'components/common/Tooltip'
import useSlippage from 'hooks/settings/useSlippage'
import useAccountId from 'hooks/accounts/useAccountId'
import useStore from 'store'

interface Props {
  row: Row<DepositedVault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function VaultExpanded(props: Props) {
  const vault = props.row.original
  const accountId = useAccountId()
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const [slippage] = useSlippage()

  const depositMoreHandler = useCallback(() => {
    useStore.setState({
      farmModal: {
        farm: props.row.original,
        isDeposited: true,
        selectedBorrowDenoms: [props.row.original.denoms.secondary],
        isCreate: false,
        type: 'vault',
      },
    })
  }, [props.row.original])

  const unlockHandler = useCallback(() => {
    useStore.setState({ unlockModal: { vault } })
  }, [vault])

  const withdrawHandler = useCallback(async () => {
    if (!accountId) return
    const vaults = [props.row.original as DepositedVault]
    setIsConfirming(true)
    await withdrawFromVaults({
      accountId: accountId,
      vaults,
      slippage,
    })
  }, [accountId, props.row.original, withdrawFromVaults, slippage])

  const status = vault.status

  /* BUTTONS - Memoized to avoid recreating on every render */

  const DepositMoreButton = useMemo(
    () => (
      <Button onClick={depositMoreHandler} color='secondary' leftIcon={<Plus className='w-3' />}>
        Deposit more
      </Button>
    ),
    [depositMoreHandler],
  )

  const UnlockButton = useMemo(
    () => (
      <Tooltip
        type='info'
        content='In order to withdraw this position, you must first unlock it. This will unlock all the funds within this position.'
      >
        <Button onClick={unlockHandler} color='tertiary' leftIcon={<LockUnlocked />}>
          Unlock to withdraw
        </Button>
      </Tooltip>
    ),
    [unlockHandler],
  )

  const UnlockingButton = useMemo(
    () => (
      <Button
        onClick={withdrawHandler}
        color='tertiary'
        showProgressIndicator={isConfirming}
        leftIcon={<LockLocked />}
        disabled
      >
        {`Withdraw in ${dayjs(vault?.unlocksAt).fromNow(true)}`}
      </Button>
    ),
    [withdrawHandler, isConfirming, vault?.unlocksAt],
  )

  const UnlockedButton = useMemo(
    () => (
      <Button
        onClick={withdrawHandler}
        color='tertiary'
        showProgressIndicator={isConfirming}
        leftIcon={<AccountArrowDown />}
      >
        Withdraw funds
      </Button>
    ),
    [withdrawHandler, isConfirming],
  )

  return (
    <tr
      key={props.row.id}
      className='transition-colors hover:cursor-pointer bg-black/20'
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      <td colSpan={props.row.getAllCells().length} className='p-0'>
        <div className='flex justify-end gap-3 p-4 align-center'>
          {status && DepositMoreButton}
          {status === VaultStatus.ACTIVE && UnlockButton}
          {status === VaultStatus.UNLOCKING && UnlockingButton}
          {status === VaultStatus.UNLOCKED && UnlockedButton}
        </div>
      </td>
    </tr>
  )
}
