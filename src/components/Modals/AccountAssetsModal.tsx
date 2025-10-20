import { useState } from 'react'

import AssetsSelect from 'components/Modals/AssetsSelect'
import Modal from 'components/Modals/Modal'
import Button from 'components/common/Button'
import SearchBar from 'components/common/SearchBar'
import useStore from 'store'

export default function AccountAssetsModal() {
  const [searchString, setSearchString] = useState<string>('')
  const modal = useStore((s) => s.accountAssetsModal)

  if (!modal) return null

  const {
    debtAsset,
    availableAssets,
    swapAssets,
    selectedDenoms,
    onSelect,
    account,
    repayFromWallet,
  } = modal

  const filteredDebtAsset = availableAssets
    .filter((a: Asset) => a.denom === debtAsset.denom)
    .filter(
      (asset: Asset) =>
        asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.denom.toLowerCase().includes(searchString.toLowerCase()),
    )

  const filteredSwapAssets = swapAssets.filter(
    (asset: Asset) =>
      asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
      asset.denom.toLowerCase().includes(searchString.toLowerCase()),
  )

  const closeModal = () => {
    useStore.setState({ accountAssetsModal: null })
  }

  return (
    <Modal
      onClose={closeModal}
      header={`Select assets to repay ${debtAsset.symbol} debt`}
      modalClassName='max-w-modal-lg'
      headerClassName='border-b-white/5 border-b items-center p-4'
    >
      <div className='px-4 py-3 border-b border-white/5'>
        <SearchBar
          value={searchString}
          placeholder={`Search for e.g. "ATOM" or "Cosmos"`}
          onChange={setSearchString}
        />
      </div>
      <div className='h-full md:max-h-[446px] overflow-y-scroll scrollbar-hide'>
        <AssetsSelect
          assets={filteredDebtAsset}
          selectedDenoms={selectedDenoms}
          onChangeSelected={onSelect}
          assetsSectionTitle='Debt asset'
          nonCollateralTableAssets={filteredSwapAssets}
          nonCollateralAssetsSectionTitle='Other assets to swap for repayment'
          account={account}
          repayFromWallet={repayFromWallet}
        />
      </div>
      <div className='flex w-full p-4'>
        <Button
          className='w-full mt-4'
          text='Select Assets'
          color='tertiary'
          onClick={closeModal}
        />
      </div>
    </Modal>
  )
}
