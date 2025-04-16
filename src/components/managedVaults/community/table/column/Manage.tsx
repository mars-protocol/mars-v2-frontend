import Button from 'components/common/Button'
import { ArrowRight, LineChart, ThreeDots } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import DropDownButton from 'components/common/Button/DropDownButton'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPage, getRoute } from 'utils/route'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { useCallback } from 'react'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { INFO_ITEMS } from 'constants/warningDialog'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export const MANAGE_META = {
  accessorKey: 'details',
  header: '',
  enableSorting: false,
  meta: { className: 'w-40' },
}

interface Props {
  isLoading: boolean
  vault: ManagedVaultsData
}

export default function Manage(props: Props) {
  const { isLoading, vault } = props
  const address = useStore((s) => s.address)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const chainConfig = useChainConfig()
  const [showVaultWarning, setShowVaultWarning] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_DEPOSIT_WARNING,
    true,
  )
  const { open: showAlertDialog, close } = useAlertDialog()

  const handleVaultDetails = useCallback(() => {
    navigate(getRoute(`vaults/${vault.vault_address}/details` as Page, searchParams, address))
  }, [address, navigate, searchParams, vault.vault_address])

  const handleTrade = useCallback(() => {
    navigate(getRoute(getPage('perps', chainConfig), searchParams, address, vault.vault_account_id))
  }, [address, chainConfig, navigate, searchParams, vault.vault_account_id])

  const handleOnClick = useCallback(() => {
    if (!showVaultWarning) {
      handleVaultDetails()
      return
    }

    showAlertDialog({
      title: 'Proceed with caution',
      content: <AlertDialogItems items={INFO_ITEMS} />,
      positiveButton: {
        text: 'Continue',
        icon: <ArrowRight />,
        onClick: handleVaultDetails,
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          setShowVaultWarning(true)
          close()
        },
      },
      checkbox: {
        text: "Don't show again",
        onClick: (isChecked: boolean) => setShowVaultWarning(!isChecked),
      },
      modalClassName: '!bg-info/20',
      titleClassName: 'text-info',
    })
  }, [handleVaultDetails, showVaultWarning, showAlertDialog, setShowVaultWarning, close])

  const ITEMS = [
    {
      icon: <LineChart />,
      text: 'Trade',
      onClick: handleTrade,
    },
    {
      icon: <ThreeDots />,
      text: 'Vault Details',
      onClick: handleVaultDetails,
    },
  ]

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      {vault.isOwner ? (
        <DropDownButton items={ITEMS} color='tertiary' text='Manage' />
      ) : (
        <Button onClick={handleOnClick} color='tertiary' text='Details' />
      )}
    </div>
  )
}
