import { useCallback, useState } from 'react'

import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import Text from 'components/common/Text'
import AddFarmAssetsModalContent from 'components/Modals/AddFarmAssets/AddFarmAssetsModalContent'
import Modal from 'components/Modals/Modal'
import useStore from 'store'

export default function AddFarmBorrowAssetsModal() {
  const modal = useStore((s) => s.addFarmBorrowingsModal)
  const farmModal = useStore((s) => s.farmModal)
  const farm =
    farmModal?.type === 'astroLp' ? (farmModal?.farm as AstroLp) : (farmModal?.farm as Vault)
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>([])
  function onClose() {
    useStore.setState({
      addFarmBorrowingsModal: null,
      farmModal: farmModal ? { ...farmModal, selectedBorrowDenoms: selectedDenoms } : null,
    })
  }

  const updateSelectedDenoms = useCallback((denoms: string[]) => setSelectedDenoms(denoms), [])

  if (!modal) return null
  return (
    <Modal
      header={<Text>Add Assets</Text>}
      onClose={onClose}
      modalClassName='max-w-modal-xs'
      headerClassName=' border-b-white/5 border-b items-center p-4'
    >
      {modal ? (
        <AddFarmAssetsModalContent
          farm={farm}
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
