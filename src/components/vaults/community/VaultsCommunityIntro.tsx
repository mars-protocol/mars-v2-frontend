import Button from 'components/common/Button'
import CreateVault from 'components/vaults/community/createVault/index'
import Intro from 'components/common/Intro'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { Account, ArrowRight, HandCoins, Plus, PlusSquared, Wallet } from 'components/common/Icons'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { DocURL } from 'types/enums'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getPage, getRoute } from 'utils/route'

export default function VaultsCommunityIntro() {
  const [showVaultInformation, setShowVaultInformation] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_COMMUNITY_INFORMATION,
    true,
  )
  const { open: showAlertDialog, close } = useAlertDialog()

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)

  const openCreateVaultOverlay = useCallback(() => {
    // TODO: check for better option how to construct the route
    const baseUrl = address ? `/wallets/${address}/vaults/create` : '/vaults/create'

    navigate(baseUrl)

    useStore.setState({
      focusComponent: {
        component: <CreateVault />,
        onClose: () => {
          navigate(getRoute(getPage(pathname), searchParams, address))
        },
      },
    })
  }, [])

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
      bg='vaults-community'
      text={
        <>
          <span className='text-white'>User generated vaults </span> is a strategy where users
          borrow funds to increase their yield farming position, aiming to earn more in rewards than
          the cost of the borrowed assets.
        </>
      }
    >
      <Button text='Create Vault' color='primary' leftIcon={<Plus />} onClick={handleOnClick} />
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
    </Intro>
  )
}

const INFO_ITEMS = [
  {
    icon: <Account />,
    title: 'Create a vault',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum arcu enim, cursus vel nulla quis, euismod molestie est.',
  },
  {
    icon: <HandCoins />,
    title: 'Manage funds',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum arcu enim, cursus vel nulla quis, euismod molestie est.',
  },
  {
    icon: <Wallet />,
    title: 'Earn with performance fees',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum arcu enim, cursus vel nulla quis, euismod molestie est.',
  },
]
