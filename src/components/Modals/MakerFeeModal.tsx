import classNames from 'classnames'
import { useCallback, useState } from 'react'

import Modal from 'components/Modals/Modal'
import AssetAmountInput from 'components/common/AssetAmountInput'
import Button from 'components/common/Button'
import { Callout } from 'components/common/Callout'
import Text from 'components/common/Text'
import USD from 'configs/assets/USDollar'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { CalloutType } from 'types/enums/callOut'
import { magnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function MakerFeeModal() {
  const [makerFee, setMakerFee] = useLocalStorage(
    LocalStorageKeys.PERPS_MAKER_FEE,
    DEFAULT_SETTINGS.perpsMakerFee,
  )
  const [amount, setAmount] = useState(BN(makerFee.amount))
  const onClose = useCallback(() => {
    useStore.setState({ makerFeeModal: false })
  }, [])

  const handleActionClick = () => {
    setMakerFee({ denom: makerFee.denom, amount: amount.toString() })
    onClose()
  }

  const onUpdateAmount = useCallback((amount: BigNumber) => {
    setAmount(magnify(amount.toString(), USD))
  }, [])

  const modal = useStore((s) => s.makerFeeModal)

  if (!modal) return

  return (
    <Modal
      onClose={onClose}
      header='Maker Fee'
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
        {amount.isZero() && (
          <Callout type={CalloutType.WARNING}>
            You can not set the Maker Fee to $0.00. The recommended amount is aleast $1.00.
          </Callout>
        )}
        <Text size='sm' className='text-white/60'>
          Limit Orders are executed by third-party facilitators and require a Maker Fee to
          compensate them for their services. Increasing the maker fee enhances the likelihood of
          your order being picked up sooner.
        </Text>
        <Button
          onClick={handleActionClick}
          disabled={!amount.toNumber()}
          className='w-full !text-base'
          color='tertiary'
          text='Done'
        />
      </div>
    </Modal>
  )
}
