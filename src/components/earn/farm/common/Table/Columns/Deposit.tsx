import { useCallback } from 'react'

import { LocalStorageKeys } from '../../../../../../constants/localStorageKeys'
import useChainConfig from '../../../../../../hooks/chain/useChainConfig'
import useAlertDialog from '../../../../../../hooks/common/useAlertDialog'
import useLocalStorage from '../../../../../../hooks/localStorage/useLocalStorage'
import useStore from '../../../../../../store'
import ActionButton from '../../../../../common/Button/ActionButton'
import { Enter, Plus, TrashBin, Wallet } from '../../../../../common/Icons'
import Loading from '../../../../../common/Loading'
import { AlertDialogItems } from '../../../../../Modals/AlertDialog/AlertDialogItems'

interface Props {
  isPerps?: boolean
  isLoading: boolean
  vault: Vault | DepositedVault | PerpsVault
}

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

export const Deposit = (props: Props) => {
  const chainConfig = useChainConfig()
  const [showPerpsVaultInformation, setShowPerpsVaultInformation] = useLocalStorage<boolean>(
    chainConfig.id + '/' + LocalStorageKeys.PERPS_VAULT_INFORMATION,
    true,
  )
  const { open: openAlertDialog, close } = useAlertDialog()

  function enterVaultHandler() {
    if (props.isPerps && !showPerpsVaultInformation) {
      openPerpsVaultModal()
      return
    }

    if (props.isPerps && showPerpsVaultInformation) {
      openPerpsVaultInfoDialog()
      return
    }

    const vault = props.vault as Vault

    useStore.setState({
      farmModal: {
        farm: vault,
        selectedBorrowDenoms: [vault.denoms.secondary],
        isCreate: true,
        type: 'vault',
      },
    })
  }

  const openPerpsVaultModal = useCallback(() => {
    useStore.setState({
      perpsVaultModal: {
        type: 'deposit',
      },
    })
  }, [])

  const openPerpsVaultInfoDialog = useCallback(() => {
    openAlertDialog({
      title: 'Information on perps vaults',
      content: <AlertDialogItems items={INFO_ITEMS} />,
      positiveButton: {
        text: 'Continue',
        icon: <Enter />,
        onClick: openPerpsVaultModal,
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          setShowPerpsVaultInformation(true)
          close()
        },
      },
      checkbox: {
        text: "Don't show again",
        onClick: (isChecked: boolean) => setShowPerpsVaultInformation(!isChecked),
      },
    })
  }, [close, openAlertDialog, openPerpsVaultModal, setShowPerpsVaultInformation])

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton
        onClick={enterVaultHandler}
        color='tertiary'
        text='Deposit'
        leftIcon={<Plus />}
        short
      />
    </div>
  )
}

const INFO_ITEMS = [
  {
    icon: <Wallet />,
    title: 'Your leverage may be affected',
    description:
      'When depositing into this vault, your deposited value is removed from your total collateral value. This increases your overall leverage.',
  },
  {
    icon: <TrashBin />,
    title: 'Does not count towards collateral',
    description: 'Your deposits into the perps vault do not count towards your collateral.',
  },
]
