import { useCallback, useState } from 'react'

import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import Modal from 'components/Modals/Modal'
import AddVaultAssetsModalContent from 'components/Modals/AddVaultAssets/AddVaultBorrowAssetsModalContent'
import Text from 'components/common/Text'
import useStore from 'store'

export default function AddVaultBorrowAssetsModal() {
  const modal = useStore((s) => s.addVaultBorrowingsModal)
  const vaultModal = useStore((s) => s.vaultModal)
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>([])

  function onClose() {
    if (!vaultModal) return

    useStore.setState({
      addVaultBorrowingsModal: null,
      vaultModal: { ...vaultModal, selectedBorrowDenoms: selectedDenoms },
    })
  }

  const updateSelectedDenoms = useCallback((denoms: string[]) => setSelectedDenoms(denoms), [])

  const showContent = modal && vaultModal?.vault

  if (!showContent) return null
  return (
    <Modal
      header={<Text>Add Assets</Text>}
      onClose={onClose}
      modalClassName='max-w-modal-xs'
      headerClassName='bg-white/10 border-b-white/5 border-b items-center p-4'
    >
      {showContent ? (
        <AddVaultAssetsModalContent
          vault={vaultModal?.vault}
          defaultSelectedDenoms={modal.selectedDenoms}
          onChangeBorrowDenoms={updateSelectedDenoms}
        />
      ) : (
        <div className='flex items-center justify-center w-full h-[380px]'>
          <CircularProgress />
        </div>
      )}
      <div className='flex w-full p-4'>
        <Button className='w-full' onClick={onClose} color='tertiary' text='Select Assets' />
      </div>
    </Modal>
  )
}
