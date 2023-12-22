import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import DisplayCurrency from 'components/DisplayCurrency'
import DoubleLogo from 'components/DoubleLogo'
import { FormattedNumber } from 'components/FormattedNumber'
import Modal from 'components/Modal'
import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { ORACLE_DENOM } from 'constants/oracle'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAccountId from 'hooks/useAccountId'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

export default function WithdrawFromVaultsModal() {
  const modal = useStore((s) => s.withdrawFromVaultsModal)
  const accountId = useAccountId()
  const { data: prices } = usePrices()
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const assets = useAllAssets()

  function onClose() {
    useStore.setState({ withdrawFromVaultsModal: null })
  }

  function withdrawHandler() {
    if (!accountId || !modal) return
    withdrawFromVaults({
      accountId: accountId,
      vaults: modal,
      slippage,
    })
    onClose()
  }

  if (!modal) return null

  return (
    <Modal
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
        <div className='flex flex-wrap w-full gap-4'>
          {modal.map((vault) => {
            const positionValue = vault.values.unlocking
            const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue)
            const primaryAsset = assets.find(byDenom(vault.denoms.primary))
            const secondaryAsset = assets.find(byDenom(vault.denoms.secondary))

            if (!primaryAsset || !secondaryAsset) return null
            const primaryAssetPrice = prices.find(byDenom(primaryAsset.denom))?.amount ?? 1
            const secondaryAssetPrice = prices.find(byDenom(secondaryAsset.denom))?.amount ?? 1

            const primaryAssetAmount = positionValue.dividedBy(primaryAssetPrice).dividedBy(2)
            const secondaryAssetAmount = positionValue.dividedBy(secondaryAssetPrice).dividedBy(2)

            return (
              <div className='flex items-center gap-4' key={vault.unlockId}>
                <DoubleLogo
                  primaryDenom={vault.denoms.primary}
                  secondaryDenom={vault.denoms.secondary}
                />
                <div className='flex flex-wrap flex-1'>
                  <Text className='w-full'>{vault.name}</Text>
                  <Text size='sm' className='w-full text-white/50'>
                    Unlocked
                  </Text>
                </div>
                <div className='flex flex-wrap'>
                  <DisplayCurrency coin={coin} className='w-full text-right' />
                  <FormattedNumber
                    amount={Number(primaryAssetAmount.toPrecision(4))}
                    className='w-full text-sm text-right text-white/50'
                    options={{
                      suffix: ` ${vault.symbols.primary}`,
                      maxDecimals: primaryAsset.decimals,
                    }}
                    animate
                  />
                  <FormattedNumber
                    amount={Number(secondaryAssetAmount.toPrecision(4))}
                    className='w-full text-sm text-right text-white/50'
                    options={{
                      suffix: ` ${vault.symbols.secondary}`,
                      maxDecimals: secondaryAsset.decimals,
                    }}
                    animate
                  />
                </div>
              </div>
            )
          })}
          <Button onClick={withdrawHandler} className='w-full mt-4' text='Withdraw from all' />
        </div>
      ) : (
        <div className='flex items-center justify-center w-full h-[380px]'>
          <CircularProgress />
        </div>
      )}
    </Modal>
  )
}
