import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import DisplayCurrency from 'components/DisplayCurrency'
import VaultLogo from 'components/Earn/Farm/VaultLogo'
import { FormattedNumber } from 'components/FormattedNumber'
import Modal from 'components/Modal'
import Text from 'components/Text'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function WithdrawFromVaults() {
  const modal = useStore((s) => s.withdrawFromVaultsModal)
  const { accountId } = useParams()
  const [isConfirming, setIsConfirming] = useState(false)
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const baseCurrency = useStore((s) => s.baseCurrency)

  function onClose() {
    useStore.setState({ withdrawFromVaultsModal: null })
  }

  async function withdrawHandler() {
    if (!accountId || !modal) return
    setIsConfirming(true)
    await withdrawFromVaults({
      fee: hardcodedFee,
      accountId: accountId,
      vaults: modal,
    })
    setIsConfirming(false)
    onClose()
  }

  return (
    <Modal
      open={!!modal}
      onClose={onClose}
      header={
        <span className='flex items-center'>
          <Text>Unlocked Vaults</Text>
        </span>
      }
      modalClassName='max-w-modal-xs'
      headerClassName='px-4 py-5.5 border-b-white/5 border-b'
      contentClassName='p-4'
    >
      {modal ? (
        <div className='flex w-full flex-wrap gap-4'>
          {modal.map((vault) => {
            const positionValue = vault.values.primary.plus(vault.values.secondary)
            const coin = BNCoin.fromDenomAndBigNumber(baseCurrency.denom, positionValue)
            const primaryAsset = getAssetByDenom(vault.denoms.primary)
            const secondaryAsset = getAssetByDenom(vault.denoms.secondary)

            if (!primaryAsset || !secondaryAsset) return null
            return (
              <div className='flex items-center gap-4' key={vault.unlockId}>
                <VaultLogo vault={vault} />
                <div className='flex flex-1 flex-wrap'>
                  <Text className='w-full'>{vault.name}</Text>
                  <Text size='sm' className='w-full text-white/50'>
                    Unlocked
                  </Text>
                </div>
                <div className='flex flex-wrap'>
                  <DisplayCurrency coin={coin} className='w-full text-right' />
                  <FormattedNumber
                    amount={BN(demagnify(vault.amounts.primary, primaryAsset))}
                    className='w-full text-right text-sm text-white/50'
                    options={{ suffix: ` ${vault.symbols.primary}` }}
                    animate
                  />
                  <FormattedNumber
                    amount={BN(demagnify(vault.amounts.secondary, secondaryAsset))}
                    className='w-full text-right text-sm text-white/50'
                    options={{ suffix: ` ${vault.symbols.secondary}` }}
                    animate
                  />
                </div>
              </div>
            )
          })}
          <Button
            showProgressIndicator={isConfirming}
            onClick={withdrawHandler}
            className='mt-4 w-full'
            text='Withdraw from all'
          />
        </div>
      ) : (
        <CircularProgress />
      )}
    </Modal>
  )
}
