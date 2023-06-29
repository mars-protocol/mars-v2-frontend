import VaultLogo from 'components/Earn/vault/VaultLogo'
import Modal from 'components/Modal'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import VaultModalContent from 'components/Modals/Vault/VaultModalContent'

export default function VaultModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.vaultModal)
  const primaryAsset = ASSETS.find((asset) => asset.denom === modal?.vault.denoms.primary)
  const secondaryAsset = ASSETS.find((asset) => asset.denom === modal?.vault.denoms.secondary)

  if (!modal || !currentAccount || !primaryAsset || !secondaryAsset) return null

  return (
    <VaultModal
      currentAccount={currentAccount}
      modal={modal}
      primaryAsset={primaryAsset}
      secondaryAsset={secondaryAsset}
    />
  )
}

interface Props {
  currentAccount: Account
  modal: VaultModal
  primaryAsset: Asset
  secondaryAsset: Asset
}

function VaultModal(props: Props) {
  function onClose() {
    useStore.setState({ vaultModal: null })
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-4'>
          <VaultLogo vault={props.modal.vault} />
          <Text>{`${props.modal.vault.symbols.primary} - ${props.modal.vault.symbols.secondary}`}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <VaultModalContent
        vault={props.modal.vault}
        primaryAsset={props.primaryAsset}
        secondaryAsset={props.secondaryAsset}
        account={props.currentAccount}
        isDeposited={props.modal.isDeposited}
      />
    </Modal>
  )
}
