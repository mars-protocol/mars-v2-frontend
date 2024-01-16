import moment from 'moment'
import { useCallback, useMemo } from 'react'

import DoubleLogo from 'components/common/DoubleLogo'
import { InfoCircle } from 'components/common/Icons'
import Modal from 'components/Modals/Modal'
import VaultModalContent from 'components/Modals/Vault/VaultModalContent'
import VaultModalContentHeader from 'components/Modals/Vault/VaultModalContentHeader'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import useAsset from 'hooks/assets/useAsset'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

export default function VaultModalController() {
  const currentAccount = useCurrentAccount()
  const modal = useStore((s) => s.vaultModal)

  const primaryAsset = useAsset(modal?.vault.denoms.primary || '')
  const secondaryAsset = useAsset(modal?.vault.denoms.secondary || '')

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
  const {
    modal: { vault, isDeposited },
    primaryAsset,
    secondaryAsset,
    currentAccount,
  } = props

  const onClose = useCallback(() => {
    useStore.setState({ vaultModal: null })
  }, [])

  const unlockTime = useMemo(() => {
    if ('unlocksAt' in vault && vault.unlocksAt) {
      return moment(vault.unlocksAt)
    }
  }, [vault])

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center pr-4 py-1'>
          <DoubleLogo primaryDenom={vault.denoms.primary} secondaryDenom={vault.denoms.secondary} />
          <Text className='pl-3 pr-2'>{vault.name}</Text>
          {unlockTime && (
            <Tooltip
              content={`Account position for this vault unlocks at ${unlockTime}`}
              type={'info'}
            >
              <InfoCircle width={16} height={16} />
            </Tooltip>
          )}
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <VaultModalContentHeader vault={vault} />
      <VaultModalContent
        vault={vault}
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        account={currentAccount}
        isDeposited={isDeposited}
      />
    </Modal>
  )
}
