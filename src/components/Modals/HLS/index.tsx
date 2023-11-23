import React from 'react'

import Modal from 'components/Modal'
import Content from 'components/Modals/HLS/Deposit'
import Header from 'components/Modals/HLS/Header'
import useBorrowAsset from 'hooks/useBorrowAsset'
import useStore from 'store'
import { getAssetByDenom } from 'utils/assets'

export default function HlsModalController() {
  const modal = useStore((s) => s.hlsModal)

  const primaryAsset = getAssetByDenom(
    modal?.vault?.denoms.primary || modal?.strategy?.denoms.deposit || '',
  )

  const secondaryAsset = useBorrowAsset(modal?.strategy?.denoms.borrow || '')

  if (!primaryAsset || !secondaryAsset) return null

  if (modal?.vault)
    return (
      <HlsModal
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        vaultAddress={modal.vault.address}
      />
    )
  if (modal?.strategy)
    return (
      <HlsModal
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        strategy={modal.strategy}
        vaultAddress={null}
      />
    )

  return null
}

interface Props {
  primaryAsset: Asset
  secondaryAsset: BorrowAsset
  strategy?: HLSStrategy
  vaultAddress: string | null
}

function HlsModal(props: Props) {
  function handleClose() {
    useStore.setState({ hlsModal: null })
  }

  return (
    <Modal
      header={<Header primaryAsset={props.primaryAsset} secondaryAsset={props.secondaryAsset} />}
      headerClassName='gradient-header pl-2 pr-2.5 py-3 border-b-white/5 border-b'
      contentClassName='flex flex-col p-6'
      modalClassName='max-w-modal-md'
      onClose={handleClose}
    >
      <Content
        collateralAsset={props.primaryAsset}
        borrowAsset={props.secondaryAsset}
        vaultAddress={props.vaultAddress}
        strategy={props.strategy}
      />
    </Modal>
  )
}
