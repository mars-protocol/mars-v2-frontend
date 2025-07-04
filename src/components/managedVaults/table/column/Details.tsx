import AlertDialog from 'components/common/AlertDialog'
import Button from 'components/common/Button'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowRight, Eye, LineChart } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { INFO_ITEMS } from 'constants/warningDialog'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export const DETAILS_META = {
  accessorKey: 'details',
  header: '',
  enableSorting: false,
  meta: { className: 'w-48' },
}

interface Props {
  isLoading: boolean
  vault: ManagedVaultWithDetails
}

export default function Details(props: Props) {
  const { isLoading, vault } = props
  const address = useStore((s) => s.address)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const chainConfig = useChainConfig()
  const [showVaultWarning, setShowVaultWarning] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_DEPOSIT_WARNING,
    true,
  )
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false)

  const handleVaultDetails = useCallback(() => {
    navigate(getRoute(`vaults/${vault.vault_address}/details` as Page, searchParams, address))
  }, [address, navigate, searchParams, vault.vault_address])

  const handleTrade = useCallback(() => {
    navigate(getRoute(getPage('perps', chainConfig), searchParams, address, vault.account_id))
  }, [address, chainConfig, navigate, searchParams, vault.account_id])

  const handleOnClick = useCallback(() => {
    if (!showVaultWarning) {
      handleVaultDetails()
      return
    }

    setIsWarningDialogOpen(true)
  }, [handleVaultDetails, showVaultWarning])

  const handleDialogClose = () => {
    setIsWarningDialogOpen(false)
    setShowVaultWarning(true)
  }

  const handleContinue = () => {
    handleVaultDetails()
    setIsWarningDialogOpen(false)
  }

  const ITEMS: DropDownItem[] = [
    {
      icon: <LineChart />,
      text: 'Manage Vault',
      onClick: handleTrade,
      disabledTooltip:
        'This button redirects you to the Trade page and selects the vault account as your active account.',
      tooltipType: 'info',
    },
    {
      icon: <Eye />,
      text: 'Vault Info',
      onClick: handleVaultDetails,
    },
  ]

  if (isLoading) return <Loading />

  return (
    <>
      <div className='flex items-center justify-end'>
        {vault.isOwner ? (
          <DropDownButton items={ITEMS} color='tertiary' text='Details' />
        ) : (
          <Button onClick={handleOnClick} color='tertiary' text='Vault Info' />
        )}
      </div>

      <AlertDialog
        isOpen={isWarningDialogOpen}
        onClose={handleDialogClose}
        title='Proceed with caution'
        content={<AlertDialogItems items={INFO_ITEMS} />}
        positiveButton={{
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: handleContinue,
        }}
        negativeButton={{
          text: 'Cancel',
          onClick: handleDialogClose,
        }}
        checkbox={{
          text: "Don't show again",
          onClick: (isChecked: boolean) => setShowVaultWarning(!isChecked),
        }}
        modalClassName='!bg-info/20'
        titleClassName='text-info'
      />
    </>
  )
}
