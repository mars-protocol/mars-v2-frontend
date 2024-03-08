import moment from 'moment/moment'
import { useCallback, useMemo, useState } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { AccountArrowDown, LockLocked, LockUnlocked, Plus } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { VaultStatus } from 'types/enums/vault'

export const MANAGE_META = { accessorKey: 'details', enableSorting: false, header: '' }

interface Props {
  vault: DepositedVault
  isLoading: boolean
  isExpanded: boolean
}

export default function Manage(props: Props) {
  const accountId = useAccountId()
  const address = useStore((s) => s.address)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const [isConfirming, setIsConfirming] = useState(false)

  const depositMoreHandler = useCallback(() => {
    useStore.setState({
      vaultModal: {
        vault: props.vault,
        isDeposited: true,
        selectedBorrowDenoms: [props.vault.denoms.secondary],
        isCreate: false,
      },
    })
  }, [props.vault])

  const unlockHandler = useCallback(
    () => useStore.setState({ unlockModal: { vault: props.vault } }),
    [props.vault],
  )

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
              text: `Withdraw in ${moment(props.vault?.unlocksAt).fromNow(true)}`,
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

  if (props.isLoading) return <Loading />

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
