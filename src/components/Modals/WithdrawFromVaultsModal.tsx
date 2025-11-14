import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import DisplayCurrency from 'components/common/DisplayCurrency'
import DoubleLogo from 'components/common/DoubleLogo'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import Modal from 'components/Modals/Modal'
import { BN_ONE } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccountId from 'hooks/accounts/useAccountId'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useSlippage from 'hooks/settings/useSlippage'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getTokenPrice } from 'utils/tokens'

export default function WithdrawFromVaultsModal() {
  const modal = useStore((s) => s.withdrawFromVaultsModal)
  const accountId = useAccountId()
  const withdrawFromVaults = useStore((s) => s.withdrawFromVaults)
  const [slippage] = useSlippage()
  const assets = useDepositEnabledAssets()

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
            const primaryAssetPrice = getTokenPrice(primaryAsset.denom, assets, BN_ONE)
            const secondaryAssetPrice = getTokenPrice(secondaryAsset.denom, assets, BN_ONE)

            const primaryAssetAmount = positionValue.dividedBy(primaryAssetPrice).dividedBy(2)
            const secondaryAssetAmount = positionValue.dividedBy(secondaryAssetPrice).dividedBy(2)

            return (
              <div className='flex items-center gap-4' key={vault.unlockId}>
                <DoubleLogo
                  primaryDenom={vault.denoms.primary}
                  secondaryDenom={vault.denoms.secondary}
                />
                <div className='flex flex-wrap grow'>
                  <Text size='sm' className='w-full'>
                    {vault.name}
                  </Text>
                  <Text size='xs' className='w-full text-white/50'>
                    Unlocked
                  </Text>
                </div>
                <div className='flex flex-wrap shrink max-w-1/2'>
                  <DisplayCurrency coin={coin} className='w-full text-sm text-right' />
                  <FormattedNumber
                    amount={Number(primaryAssetAmount.toPrecision(4))}
                    className='w-full text-xs text-right text-white/50'
                    options={{
                      suffix: ` ${vault.symbols.primary}`,
                      maxDecimals: primaryAsset.decimals,
                    }}
                  />
                  <FormattedNumber
                    amount={Number(secondaryAssetAmount.toPrecision(4))}
                    className='w-full text-xs text-right text-white/50'
                    options={{
                      suffix: ` ${vault.symbols.secondary}`,
                      maxDecimals: secondaryAsset.decimals,
                    }}
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
