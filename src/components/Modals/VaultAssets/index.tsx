import { useCallback } from 'react'

import Button from 'components/common/Button'
import Text from 'components/common/Text'
import Modal from 'components/Modals/Modal'
import VaultAssetsModalContent from 'components/Modals/VaultAssets/VaultAssetsModalContent'
import useStore from 'store'

export default function VaultAssetsModal() {
  const modal = useStore((s) => s.vaultAssetsModal)
  const onClose = useCallback(() => {
    useStore.setState({
      vaultAssetsModal: { isOpen: false, selectedDenom: modal?.selectedDenom ?? '', assets: [] },
    })
  }, [modal?.selectedDenom])

  const onChangeDenom = useCallback((denom: string) => {
    useStore.setState({
      vaultAssetsModal: { isOpen: false, selectedDenom: denom, assets: [] },
    })
  }, [])

  if (!modal?.isOpen) return null

  return (
    <Modal
      header={<Text>Vault Assets</Text>}
      onClose={onClose}
      modalClassName='max-w-modal-lg'
      headerClassName='bg-white/10 border-b-white/5 border-b items-center p-4'
      dialogId='wallet-assets-modal'
    >
      <VaultAssetsModalContent
        onChangeDenom={onChangeDenom}
        assets={modal.assets}
        selectedDenom={modal.selectedDenom}
      />
      <div className='flex w-full p-4'>
        <Button className='w-full' onClick={onClose} color='tertiary' text='Select Assets' />
      </div>
    </Modal>
  )
}
