import React from 'react'

import Modal from 'components/Modal'
import Content from 'components/Modals/HLS/Content'
import Header from 'components/Modals/HLS/Header'
import useStore from 'store'

export default function HlsModalController() {
  const modal = useStore((s) => s.hlsModal)

  if (!modal?.vault) return null

  return <HlsModal vault={modal.vault} />
}

interface Props {
  vault: Vault
}

function HlsModal(props: Props) {
  function handleClose() {
    useStore.setState({ hlsModal: null })
  }

  return (
    <Modal
      header={
        <Header
          primaryDenom={props.vault.denoms.primary}
          secondaryDenom={props.vault.denoms.secondary}
        />
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-3 border-b-white/5 border-b'
      contentClassName='flex flex-col p-6  h-full overflow-y-scroll scrollbar-hide'
      modalClassName='max-w-modal-md h-[min(80%,600px)]'
      onClose={handleClose}
    >
      <Content vault={props.vault} />
    </Modal>
  )
}
