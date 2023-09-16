import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'

import Button from 'components/Button'
import DepositCapMessage from 'components/DepositCapMessage'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { ArrowRight, ExclamationMarkCircled } from 'components/Icons'
import Slider from 'components/Slider'
import Text from 'components/Text'
import TokenInput from 'components/TokenInput'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useHealthComputer from 'hooks/useHealthComputer'
import useMarketAssets from 'hooks/useMarketAssets'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { byDenom } from 'utils/array'
import { findCoinByDenom, getAssetByDenom } from 'utils/assets'
import { formatPercent } from 'utils/formatters'
import { getValueFromBNCoins, mergeBNCoinArrays } from 'utils/helpers'

export interface VaultBorrowingsProps {
  borrowings: BNCoin[]
  deposits: BNCoin[]
  primaryAsset: Asset
  secondaryAsset: Asset
  vault: Vault
  depositActions: Action[]
  onChangeBorrowings: (borrowings: BNCoin[]) => void
  displayCurrency: string
  depositCapReachedCoins: BNCoin[]
}

export default function VaultBorrowings(props: VaultBorrowingsProps) {
  const { borrowings, onChangeBorrowings } = props
  const { data: marketAssets } = useMarketAssets()
  const { data: prices } = usePrices()
  const vaultModal = useStore((s) => s.vaultModal)
  const depositIntoVault = useStore((s) => s.depositIntoVault)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)
  const [percentage, setPercentage] = useState<number>(0)

  const calculateSliderPercentage = (maxBorrowAmounts: BNCoin[], borrowings: BNCoin[]) => {
    if (borrowings.length === 1) {
      const amount = borrowings[0].amount
      if (amount.isZero()) return 0
      const max = maxBorrowAmounts.find(byDenom(borrowings[0].denom))?.amount || BN_ZERO
      return amount.times(100).dividedBy(max).toNumber()
    }
    return 0
  }

  const maxBorrowAmounts: BNCoin[] = useMemo(() => {
    return props.borrowings.map((borrowing) => {
      const maxAmount = computeMaxBorrowAmount(borrowing.denom, {
        vault: { address: props.vault.address },
      })
      return new BNCoin({
        denom: borrowing.denom,
        amount: maxAmount.toString(),
      })
    })
  }, [props.borrowings, computeMaxBorrowAmount, props.vault.address])

  const totalValue = useMemo(
    () => getValueFromBNCoins(mergeBNCoinArrays(props.deposits, props.borrowings), prices),
    [props.borrowings, props.deposits, prices],
  )

  useEffect(() => {
    const selectedBorrowDenoms = vaultModal?.selectedBorrowDenoms || []
    if (
      borrowings.length === selectedBorrowDenoms.length &&
      borrowings.every((coin) => selectedBorrowDenoms.includes(coin.denom))
    ) {
      return
    }
    const updatedBorrowings = selectedBorrowDenoms.map((denom) => {
      const amount = findCoinByDenom(denom, borrowings)?.amount || BN_ZERO

      return new BNCoin({
        denom,
        amount: amount.toString(),
      })
    })
    setPercentage(calculateSliderPercentage(maxBorrowAmounts, updatedBorrowings))
    onChangeBorrowings(updatedBorrowings)
  }, [vaultModal, maxBorrowAmounts, borrowings, onChangeBorrowings])

  function onChangeSlider(value: number) {
    if (props.borrowings.length !== 1) return

    const denom = props.borrowings[0].denom
    const currentAmount = props.borrowings[0].amount
    const maxAmount = maxBorrowAmounts.find(byDenom(denom))?.amount ?? BN_ZERO
    const newBorrowings: BNCoin[] = [
      new BNCoin({
        denom,
        amount: (
          maxAmount.plus(currentAmount).multipliedBy(value).dividedBy(100).decimalPlaces(0) ||
          BN_ZERO
        ).toString(),
      }),
    ]

    props.onChangeBorrowings(newBorrowings)
    setPercentage(value)
  }

  function updateAssets(denom: string, amount: BigNumber) {
    const index = props.borrowings.findIndex((coin) => coin.denom === denom)
    props.borrowings[index].amount = amount
    props.onChangeBorrowings([...props.borrowings])
  }

  function onDelete(denom: string) {
    const index = props.borrowings.findIndex((coin) => coin.denom === denom)
    props.borrowings.splice(index, 1)
    const newBorrowings = [...props.borrowings]
    props.onChangeBorrowings(newBorrowings)
    if (!vaultModal) return

    useStore.setState({
      vaultModal: {
        ...vaultModal,
        selectedBorrowDenoms: props.borrowings.map((coin) => coin.denom),
      },
    })
    setPercentage(calculateSliderPercentage(maxBorrowAmounts, newBorrowings))
  }

  function addAsset() {
    useStore.setState({
      addVaultBorrowingsModal: {
        selectedDenoms: props.borrowings.map((coin) => coin.denom),
      },
    })
    setPercentage(calculateSliderPercentage(maxBorrowAmounts, props.borrowings))
  }

  function onConfirm() {
    if (!updatedAccount || !vaultModal) return
    depositIntoVault({
      accountId: updatedAccount.id,
      actions: props.depositActions,
      deposits: props.deposits,
      borrowings: props.borrowings,
      isCreate: vaultModal.isCreate,
    })
    useStore.setState({ vaultModal: null })
  }

  return (
    <div className='flex flex-col flex-1 gap-4 p-4'>
      {props.borrowings.map((coin) => {
        const asset = getAssetByDenom(coin.denom)
        const maxAmount = maxBorrowAmounts.find(byDenom(coin.denom))?.amount
        if (!asset || !maxAmount)
          return <React.Fragment key={`input-${coin.denom}`}></React.Fragment>
        return (
          <TokenInput
            key={`input-${coin.denom}`}
            amount={coin.amount}
            asset={asset}
            max={maxAmount.plus(coin.amount)}
            maxText='Max Borrow'
            onChange={(amount) => updateAssets(coin.denom, amount)}
            onDelete={() => onDelete(coin.denom)}
          />
        )
      })}
      {props.borrowings.length === 1 && <Slider onChange={onChangeSlider} value={percentage} />}
      {props.borrowings.length === 0 && (
        <div className='flex items-center gap-4 py-2'>
          <div className='w-4'>
            <ExclamationMarkCircled width={20} height={20} />
          </div>
          <Text size='xs'>
            You have no borrowing assets selected. Click on select borrow assets if you would like
            to add assets to borrow.
          </Text>
        </div>
      )}

      <Button text='Select borrow assets +' color='tertiary' onClick={addAsset} />

      <DepositCapMessage
        action='deposit'
        coins={props.depositCapReachedCoins}
        className='px-4 y-2'
        showIcon
      />

      <Divider />
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between'>
          <Text className='text-white/50'>{`${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Position Value`}</Text>
          <DisplayCurrency
            coin={new BNCoin({ denom: ORACLE_DENOM, amount: totalValue.toString() })}
          />
        </div>
        {props.borrowings.map((coin) => {
          const asset = getAssetByDenom(coin.denom)
          const borrowRate = marketAssets?.find((market) => market.denom === coin.denom)?.borrowRate

          if (!asset || !borrowRate)
            return <React.Fragment key={`borrow-rate-${coin.denom}`}></React.Fragment>
          return (
            <div key={`borrow-rate-${coin.denom}`} className='flex justify-between'>
              <Text className='text-white/50'>Borrow APR {asset.symbol}</Text>
              <Text>{formatPercent(borrowRate)}</Text>
            </div>
          )
        })}
      </div>
      <Button
        onClick={onConfirm}
        color='primary'
        text='Deposit'
        rightIcon={<ArrowRight />}
        disabled={!props.depositActions.length || props.depositCapReachedCoins.length > 0}
      />
    </div>
  )
}
