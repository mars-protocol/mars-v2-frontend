import React from 'react'

import Modal from 'components/Modal'
import Header from 'components/Modals/HLS/Header'
import useStore from 'store'
import { getAssetByDenom } from 'utils/assets'

export default function HlsManageModalController() {
  const modal = useStore((s) => s.hlsManageModal)

  const collateralAsset = getAssetByDenom(modal?.staking.strategy.denoms.deposit || '')
  const borrowAsset = getAssetByDenom(modal?.staking.strategy.denoms.borrow || '')

  if (!modal || !collateralAsset || !borrowAsset) return null

  return <HlsModal collateralAsset={collateralAsset} borrowAsset={borrowAsset} />
}

interface Props {
  borrowAsset: Asset
  collateralAsset: Asset
}

function HlsModal(props: Props) {
  function handleClose() {
    useStore.setState({ hlsManageModal: null })
  }

  return (
    <Modal
      header={<Header primaryAsset={props.collateralAsset} secondaryAsset={props.borrowAsset} />}
      headerClassName='gradient-header pl-2 pr-2.5 py-3 border-b-white/5 border-b'
      contentClassName='flex flex-col p-6'
      modalClassName='max-w-modal-md'
      onClose={handleClose}
    >
      Some kind of text here
    </Modal>
  )
}
