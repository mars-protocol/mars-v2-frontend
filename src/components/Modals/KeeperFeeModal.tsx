import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from 'components/Modals/Modal'
import AssetAmountInput from 'components/common/AssetAmountInput'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Text from 'components/common/Text'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'

export default function KeeperFeeModal() {
  const chainConfig = useChainConfig()
  const creditManagerConfig = useStore((s) => s.creditManagerConfig)
  const USD = useAsset('usd')
  const modal = useStore((s) => s.keeperFeeModal)

  const defaultKeeperFee = JSON.stringify(
    creditManagerConfig?.keeper_fee_config?.min_fee ?? {
      denom: '',
      amount: '0',
    },
  )

  const [keeperFee, setKeeperFee] = useLocalStorage(
    LocalStorageKeys.PERPS_KEEPER_FEE,
    defaultKeeperFee,
  )

  const parsedKeeperFee = useMemo(() => {
    try {
      return typeof keeperFee === 'string' ? JSON.parse(keeperFee) : keeperFee
    } catch {
      return { denom: '', amount: '0' }
    }
  }, [keeperFee])

  const [amount, setAmount] = useState(() => {
    return BN(parsedKeeperFee?.amount ?? '0').shiftedBy(2 - PRICE_ORACLE_DECIMALS)
  })

  const onClose = useCallback(() => {
    useStore.setState({ keeperFeeModal: false })
  }, [])

  const minKeeperFee = BN(creditManagerConfig?.keeper_fee_config?.min_fee?.amount ?? '0')
  const isLessThanMin = amount.isLessThan(minKeeperFee?.shiftedBy(2 - PRICE_ORACLE_DECIMALS))

  useEffect(() => {
    if (parsedKeeperFee?.amount) {
      setAmount(BN(parsedKeeperFee.amount).shiftedBy(2 - PRICE_ORACLE_DECIMALS))
    }
  }, [parsedKeeperFee])

  const handleActionClick = () => {
    if (!USD || !parsedKeeperFee.denom) return

    setKeeperFee(
      JSON.stringify({
        denom: parsedKeeperFee.denom,
        amount: amount.shiftedBy(PRICE_ORACLE_DECIMALS - 2).toString(),
      }),
    )
    onClose()
  }

  const onUpdateAmount = useCallback(
    (newAmount: BigNumber) => {
      if (!USD) return
      setAmount(newAmount)
    },
    [USD],
  )

  if (!modal || !USD || !chainConfig.perps) return null

  return (
    <Modal
      onClose={onClose}
      header='Keeper Fee'
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
        {isLessThanMin && (
          <Callout type={CalloutType.WARNING}>
            You can not set the Keeper Fee to less than $
            {minKeeperFee?.shiftedBy(-PRICE_ORACLE_DECIMALS).toString()} as it is the minimum amount
            for the Keeper Fee.
          </Callout>
        )}
        <Text size='sm' className='text-white/60'>
          Limit Orders are executed by third-party facilitators and require a Keeper Fee to
          compensate them for their services. Increasing the Keeper Fee enhances the likelihood of
          your order being picked up sooner.
        </Text>
        <Button
          onClick={handleActionClick}
          disabled={isLessThanMin}
          className='w-full !text-base'
          color='tertiary'
          text='Done'
        />
      </div>
    </Modal>
  )
}
