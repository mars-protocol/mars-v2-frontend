import { useCallback, useState } from 'react'

import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import Text from 'components/common/Text'
import AddVLiquidityPoolAssetsModalContent from 'components/Modals/AddLiquidityPoolAssets/AddLiquidityPoolBorrowAssetsModalContent'
import Modal from 'components/Modals/Modal'
import useStore from 'store'

export default function AddLiquidityPoolBorrowAssetsModal() {
  const modal = useStore((s) => s.addLiquidityPoolBorrowingsModal)
  const vaultModal = useStore((s) => s.vaultModal)
  const farmModal = useStore((s) => s.farmModal)
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>([])
  const pool = vaultModal?.vault ?? farmModal?.farm
  function onClose() {
    if (vaultModal) {
      useStore.setState({
        addLiquidityPoolBorrowingsModal: null,
        vaultModal: { ...vaultModal, selectedBorrowDenoms: selectedDenoms },
      })
    }

    if (farmModal) {
      useStore.setState({
        addLiquidityPoolBorrowingsModal: null,
        farmModal: { ...farmModal, selectedBorrowDenoms: selectedDenoms },
      })
    }
  }

  const updateSelectedDenoms = useCallback((denoms: string[]) => setSelectedDenoms(denoms), [])

  const showContent = modal && !!pool

  if (!showContent) return null
  return (
    <Modal
      header={<Text>Add Assets</Text>}
      onClose={onClose}
      modalClassName='max-w-modal-xs'
      headerClassName='bg-white/10 border-b-white/5 border-b items-center p-4'
    >
      {showContent ? (
        <AddVLiquidityPoolAssetsModalContent
          pool={pool}
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
