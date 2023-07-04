import { useCallback, useState } from 'react'

import CurrentAccountSummary from 'components/Account/CurrentAccountSummary'
import AssetImage from 'components/AssetImage'
import Button from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset
  title: string
  isOpen: boolean
  coinBalances: Coin[]
  contentHeader?: JSX.Element
  actionButtonText: string
  showLoaderInButton: boolean
  accountSummaryChange?: AccountChange
  onClose: () => void
  onChange: (value: BigNumber) => void
  onAction: (value: BigNumber, isMax: boolean) => void
}

export default function AssetAmountSelectActionModal(props: Props) {
  const {
    asset,
    title,
    isOpen,
    coinBalances,
    contentHeader = null,
    actionButtonText,
    showLoaderInButton,
    accountSummaryChange,
    onClose,
    onChange,
    onAction,
  } = props
  const [amount, setAmount] = useState(BN(0))
  const maxAmount = BN(coinBalances.find(byDenom(asset.denom))?.amount ?? 0)

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      setAmount(value)
      onChange(value)
    },
    [onChange],
  )

  const handleActionClick = useCallback(() => {
    onAction(amount, amount.eq(maxAmount))
  }, [amount, maxAmount, onAction])

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-4'>
          <AssetImage size={24} asset={asset} />
          <Text>{title}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col min-h-[400px]'
    >
      {contentHeader}
      <div className='flex flex-grow items-start gap-6 p-6'>
        <Card
          className='flex flex-grow bg-white/5 p-4'
          contentClassName='gap-6 flex flex-col justify-between h-full'
        >
          <TokenInputWithSlider
            asset={asset}
            onChange={handleAmountChange}
            amount={amount}
            max={maxAmount}
            hasSelect
            maxText='Max'
          />
          <Divider />
          <Button
            onClick={handleActionClick}
            showProgressIndicator={showLoaderInButton}
            disabled={!amount.toNumber()}
            className='w-full'
            text={actionButtonText}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <CurrentAccountSummary change={accountSummaryChange} />
      </div>
    </Modal>
  )
}
