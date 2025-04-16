import Button from 'components/common/Button'
import { Account, ArrowRight, HandCoins, Plus, PlusSquared, Wallet } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { DocURL } from 'types/enums'
import { getPage, getRoute } from 'utils/route'

export default function VaultsCommunityIntro() {
  const [showVaultInformation, setShowVaultInformation] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_COMMUNITY_INFORMATION,
    true,
  )
  const { open: showAlertDialog, close } = useAlertDialog()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const showTutorial = useStore((s) => s.tutorial)

  const openCreateVaultOverlay = useCallback(() => {
    if (!address) {
      console.error('Wallet address is required to create a vault')
      return
    }
    navigate(getRoute(getPage('vaults/create', chainConfig), searchParams, address))
  }, [address, navigate, chainConfig, searchParams])

  const handleOnClick = useCallback(() => {
    if (!showVaultInformation) {
      openCreateVaultOverlay()
      return
    }

    showAlertDialog({
      title: 'Become a Vault Manager',
      content: <AlertDialogItems items={INFO_ITEMS} />,

      positiveButton: {
        text: 'Continue',
        icon: <ArrowRight />,
        onClick: openCreateVaultOverlay,
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          setShowVaultInformation(true)
          close()
        },
      },
      checkbox: {
        text: "Don't show again",
        onClick: (isChecked: boolean) => setShowVaultInformation(!isChecked),
      },
    })
  }, [
    close,
    showAlertDialog,
    showVaultInformation,
    setShowVaultInformation,
    openCreateVaultOverlay,
  ])

  return (
    <Intro
      bg='vaults'
      isCompact={!showTutorial}
      text={
        showTutorial ? (
          <>
            <span className='text-white'>User generated vaults </span> is a strategy where users
            borrow funds to increase their yield farming position, aiming to earn more in rewards
            than the cost of the borrowed assets.
          </>
        ) : (
          <>
            <span className='text-white'>Become a Vault Manager</span> and create your own strategy.
            Earn management fees from users who deposit into your vault.
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
            // TODO: add docs URL
            window.open(DocURL.DOCS_URL, '_blank')
          }}
          color='secondary'
        />
      )}
    </Intro>
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
