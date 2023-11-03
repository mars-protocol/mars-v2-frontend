import React from 'react'

import Modal from 'components/Modal'
import Content from 'components/Modals/HLS/Content'
import Header from 'components/Modals/HLS/Header'
import useStore from 'store'

export default function HlsModalController() {
  const modal = useStore((s) => s.hlsModal)

  if (modal?.vault)
    return (
      <HlsModal
        collateralDenom={modal.vault.denoms.primary}
        borrowDenom={modal.vault.denoms.secondary}
        vaultAddress={modal.vault.address}
      />
    )
  if (modal?.strategy)
    return (
      <HlsModal
        collateralDenom={modal.strategy.denoms.deposit}
        borrowDenom={modal.strategy.denoms.borrow}
        vaultAddress={null}
      />
    )

  return null
}

interface Props {
  borrowDenom: string
  collateralDenom: string
  vaultAddress: string | null
}

function HlsModal(props: Props) {
  function handleClose() {
    useStore.setState({ hlsModal: null })
  }

  return (
    <Modal
      header={<Header primaryDenom={props.collateralDenom} secondaryDenom={props.borrowDenom} />}
      headerClassName='gradient-header pl-2 pr-2.5 py-3 border-b-white/5 border-b'
      contentClassName='flex flex-col p-6'
      modalClassName='max-w-modal-md'
      onClose={handleClose}
    >
      <Content
        collateralDenom={props.collateralDenom}
        borrowDenom={props.borrowDenom}
        vaultAddress={props.vaultAddress}
      />
    </Modal>
  )
}
