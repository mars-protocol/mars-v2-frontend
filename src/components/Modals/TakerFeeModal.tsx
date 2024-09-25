import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'

import Modal from 'components/Modals/Modal'
import AssetAmountInput from 'components/common/AssetAmountInput'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Text from 'components/common/Text'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ONE } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { magnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function TakerFeeModal() {
  const chainConfig = useChainConfig()
  const [takerFee, setTakerFee] = useLocalStorage(
    LocalStorageKeys.PERPS_TAKER_FEE,
    getDefaultChainSettings(chainConfig).perpsTakerFee,
  )
  const [amount, setAmount] = useState(BN(takerFee.amount))
  const USD = useAsset('usd')

  const onClose = useCallback(() => {
    useStore.setState({ takerFeeModal: false })
  }, [])

  useEffect(() => {
    setAmount(BN(takerFee.amount))
  }, [takerFee])

  const handleActionClick = () => {
    setTakerFee({ denom: takerFee.denom, amount: amount.toString() })
    onClose()
  }

  const onUpdateAmount = useCallback(
    (amount: BigNumber) => {
      if (!USD) return
      setAmount(magnify(amount.toString(), USD))
    },
    [USD],
  )

  const modal = useStore((s) => s.takerFeeModal)

  if (!modal || !USD) return

  return (
    <Modal
      onClose={onClose}
      header='Taker Fee'
      headerClassName='gradient-header px-2 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
      modalClassName='md:max-w-modal-xs'
    >
      <div
        className={classNames(
          'flex flex-wrap items-start flex-1 p-2 gap-2 w-full',
          'md:p-4 md:gap-6',
        )}
      >
        <AssetAmountInput
          amount={amount}
          containerClassName='w-full'
          setAmount={onUpdateAmount}
          asset={USD}
          isUSD
        />
        {amount.isLessThan(BN_ONE) && (
          <Callout type={CalloutType.WARNING}>
            You can not set the Taker Fee to less than $1.00 as it is the minimum amount for the
            Taker Fee.
          </Callout>
        )}
        <Text size='sm' className='text-white/60'>
          Limit Orders are executed by third-party facilitators and require a Taker Fee to
          compensate them for their services. Increasing the Taker Fee enhances the likelihood of
          your order being picked up sooner.
        </Text>
        <Button
          onClick={handleActionClick}
          disabled={amount.isLessThan(BN_ONE)}
          className='w-full !text-base'
          color='tertiary'
          text='Done'
        />
      </div>
    </Modal>
  )
}
