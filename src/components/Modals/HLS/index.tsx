import Content from 'components/Modals/HLS/Deposit'
import Header from 'components/Modals/HLS/Header'
import Modal from 'components/Modals/Modal'
import useAsset from 'hooks/assets/useAsset'
import useMarket from 'hooks/markets/useMarket'
import useStore from 'store'

export default function HlsModalController() {
  const modal = useStore((s) => s.hlsModal)

  const primaryAsset = useAsset(
    modal?.vault?.denoms.primary || modal?.strategy?.denoms.deposit || '',
  )

  const secondaryAsset = useMarket(modal?.strategy?.denoms.borrow || '')

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
  secondaryAsset: Market
  strategy?: HLSStrategy
  vaultAddress: string | null
}

function HlsModal(props: Props) {
  function handleClose() {
    useStore.setState({ hlsModal: null })
  }

  return (
    <Modal
      header={
        <Header primaryAsset={props.primaryAsset} secondaryAsset={props.secondaryAsset.asset} />
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-3 border-b-white/5 border-b'
      contentClassName='flex flex-col p-2 md:p-6 h-screen-full md:h-auto'
      modalClassName='max-w-screen-full md:max-w-modal-md '
      onClose={handleClose}
    >
      <Content
        collateralAsset={props.primaryAsset}
        borrowMarket={props.secondaryAsset}
        vaultAddress={props.vaultAddress}
        strategy={props.strategy}
      />
    </Modal>
  )
}
