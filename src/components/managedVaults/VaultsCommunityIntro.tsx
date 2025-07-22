import AlertDialog from 'components/common/AlertDialog'
import Button from 'components/common/Button'
import { Account, ArrowRight, HandCoins, Plus, PlusSquared, Wallet } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import WalletSelect from 'components/Wallet/WalletSelect'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { DocURL } from 'types/enums'
import { getPage, getRoute } from 'utils/route'

export default function VaultsCommunityIntro() {
  const [showVaultInformation, setShowVaultInformation] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_COMMUNITY_INFORMATION,
    true,
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const showTutorial = useStore((s) => s.tutorial)

  const openCreateVaultOverlay = useCallback(() => {
    if (!address) {
      useStore.setState({ focusComponent: { component: <WalletSelect /> } })
      return
    }
    navigate(getRoute(getPage('vaults/create', chainConfig), searchParams, address))
  }, [address, navigate, chainConfig, searchParams])

  const handleOnClick = useCallback(() => {
    if (!showVaultInformation) {
      openCreateVaultOverlay()
      return
    }

    setIsDialogOpen(true)
  }, [showVaultInformation, openCreateVaultOverlay])

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleContinue = () => {
    openCreateVaultOverlay()
    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setShowVaultInformation(true)
    setIsDialogOpen(false)
  }

  return (
    <>
      <Intro
        bg='vaults'
        isCompact={!showTutorial}
        text={
          showTutorial ? (
            <>
              <span className='text-white'>User generated vaults</span> are managed strategies where
              vault creators use deposited funds to run trading strategies aiming to generate
              returns for both themselves and their depositors.
            </>
          ) : (
            <>
              <span className='text-white'>Become a Vault Manager</span> and create your own
              strategy. Earn management fees from users who deposit into your vault.
            </>
          )
        }
      >
        <Button text='Create Vault' color='primary' leftIcon={<Plus />} onClick={handleOnClick} />
        {showTutorial && (
          <Button
            text='Learn more'
            leftIcon={<PlusSquared />}
            onClick={(e) => {
              e.preventDefault()
              window.open(DocURL.CREATE_VAULT_URL, '_blank')
            }}
            color='secondary'
          />
        )}
      </Intro>

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        title='Become a Vault Manager'
        content={<AlertDialogItems items={INFO_ITEMS} />}
        positiveButton={{
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: handleContinue,
        }}
        negativeButton={{
          text: 'Cancel',
          onClick: handleCancel,
        }}
        checkbox={{
          text: "Don't show again",
          onClick: (isChecked: boolean) => setShowVaultInformation(!isChecked),
        }}
      />
    </>
  )
}

const INFO_ITEMS = [
  {
    icon: <Account />,
    title: 'Create a managed vault',
    description:
      'Design your own vault by setting up assets, strategies, and risk parameters that others can invest in.',
  },
  {
    icon: <HandCoins />,
    title: 'Implement strategies',
    description:
      'Choose from various strategies including lending, borrowing, or perpetuals to optimize returns for your vault participants.',
  },
  {
    icon: <Wallet />,
    title: 'Earn management fees',
    description:
      'Set your fee structure and withdrawal periods to generate revenue as your vault performs well for investors.',
  },
]
