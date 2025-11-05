import dayjs from 'utils/dayjs'
import { useCallback, useMemo, useState } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { AccountArrowDown, LockLocked, LockUnlocked, Plus } from 'components/common/Icons'
import useAccountId from 'hooks/accounts/useAccountId'
import useSlippage from 'hooks/settings/useSlippage'
import useStore from 'store'
import { VaultStatus } from 'types/enums'

export const MANAGE_META = {
  accessorKey: 'details',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

interface Props {
  vault: DepositedVault
  isExpanded: boolean
  isPerps: boolean
}

export default function VaultManage(props: Props) {
  const accountId = useAccountId()
  const address = useStore((s) => s.address)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const [slippage] = useSlippage()
  const [isConfirming, setIsConfirming] = useState(false)

  const depositMoreHandler = useCallback(() => {
    if (props.isPerps) {
      useStore.setState({
        perpsVaultModal: {
          type: 'deposit',
        },
      })
      return
    }

    useStore.setState({
      farmModal: {
        farm: props.vault,
        isDeposited: true,
        selectedBorrowDenoms: [props.vault.denoms.secondary],
        isCreate: false,
        type: 'vault',
      },
    })
  }, [props.isPerps, props.vault])

  const unlockHandler = useCallback(() => {
    if (props.isPerps) {
      useStore.setState({
        perpsVaultModal: {
          type: 'unlock',
        },
      })
      return
    }

    useStore.setState({ unlockModal: { vault: props.vault } })
  }, [props.isPerps, props.vault])

  const withdrawHandler = useCallback(async () => {
    if (!accountId) return
    setIsConfirming(true)
    await withdrawFromVaults({
      accountId: accountId,
      vaults: [props.vault],
      slippage,
    })
  }, [accountId, props.vault, slippage, withdrawFromVaults])

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <Plus />,
        text: 'Deposit more',
        onClick: depositMoreHandler,
      },
      ...(props.vault.status === VaultStatus.ACTIVE
        ? [
            {
              icon: <LockUnlocked />,
              text: 'Unlock to withdraw',
              onClick: unlockHandler,
            },
          ]
        : []),
      ...(props.vault.status === VaultStatus.UNLOCKING
        ? [
            {
              icon: <LockLocked />,
              text: `Withdraw in ${dayjs(props.vault?.unlocksAt).fromNow(true)}`,
              onClick: () => {},
              disabled: true,
              disabledTooltip: '',
            },
          ]
        : []),
      ...(props.vault.status === VaultStatus.UNLOCKED
        ? [
            {
              icon: <AccountArrowDown />,
              text: 'Withdraw funds',
              onClick: withdrawHandler,
            },
          ]
        : []),
    ],
    [
      depositMoreHandler,
      props.vault.status,
      props.vault?.unlocksAt,
      unlockHandler,
      withdrawHandler,
    ],
  )

  if (!address) return null

  return (
    <div className='z-10 flex justify-end'>
      <DropDownButton
        items={ITEMS}
        text='Manage'
        color='tertiary'
        showProgressIndicator={isConfirming}
      />
    </div>
  )
}
