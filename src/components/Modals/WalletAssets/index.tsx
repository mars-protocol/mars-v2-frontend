import { useCallback, useState } from 'react'

import Button from 'components/Button'
import Modal from 'components/Modal'
import WalletAssetsModalContent from 'components/Modals/WalletAssets/WalletAssetsModalContent'
import Text from 'components/Text'
import useStore from 'store'

export default function WalletAssetsModal() {
  const modal = useStore((s) => s.walletAssetsModal)
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>([])

  const onClose = useCallback(() => {
    useStore.setState({
      walletAssetsModal: { isOpen: false, selectedDenoms },
    })
  }, [selectedDenoms])

  if (!modal?.isOpen) return null

  return (
    <Modal
      header={<Text>Your wallet</Text>}
      onClose={onClose}
      modalClassName='max-w-modal-xs'
      headerClassName='bg-white/10 border-b-white/5 border-b items-center p-4'
      dialogId='wallet-assets-modal'
    >
      <WalletAssetsModalContent onChangeDenoms={setSelectedDenoms} />
      <div className='flex w-full p-4'>
        <Button className='w-full' onClick={onClose} color='tertiary' text='Select Assets' />
      </div>
    </Modal>
  )
}
