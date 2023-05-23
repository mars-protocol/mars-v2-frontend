import VaultLogo from 'components/Earn/vault/VaultLogo'
import Modal from 'components/Modal'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { CircularProgress } from 'components/CircularProgress'

import VaultModalContent from './VaultModalContent'

export default function VaultModal() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.vaultModal)

  const primaryAsset =
    ASSETS.find((asset) => asset.denom === modal?.vault.denoms.primary) ?? ASSETS[0]
  const secondaryAsset =
    ASSETS.find((asset) => asset.denom === modal?.vault.denoms.secondary) ?? ASSETS[0]

  const hasValidData = primaryAsset && currentAccount && secondaryAsset

  function onClose() {
    useStore.setState({ vaultModal: null })
  }

  return (
    <Modal
      open={!!(modal && hasValidData)}
      onClose={onClose}
      header={
        modal && (
          <span className='flex items-center gap-4 px-4'>
            <VaultLogo vault={modal.vault} />
            <Text>{`${modal.vault.symbols.primary} - ${modal.vault.symbols.secondary}`}</Text>
          </span>
        )
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      {modal?.vault && currentAccount ? (
        <VaultModalContent
          vault={modal.vault}
          primaryAsset={primaryAsset}
          secondaryAsset={secondaryAsset}
          currentAccount={currentAccount}
        />
      ) : (
        <CircularProgress />
      )}
    </Modal>
  )
}
