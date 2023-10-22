import { useCallback, useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import AssetImage from 'components/Asset/AssetImage'
import Button from 'components/Button'
import Card from 'components/Card'
import Divider from 'components/Divider'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/useCurrentAccount'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset
  title: string
  coinBalances: Coin[]
  actionButtonText: string
  contentHeader?: JSX.Element
  onClose: () => void
  onChange: (value: BigNumber) => void
  onAction: (value: BigNumber, isMax: boolean) => void
}

export default function AssetAmountSelectActionModal(props: Props) {
  const {
    asset,
    title,
    coinBalances,
    actionButtonText,
    contentHeader = null,
    onClose,
    onChange,
    onAction,
  } = props
  const [amount, setAmount] = useState(BN_ZERO)
  const [openElement, setOpenElement] = useState<number | undefined>()
  const maxAmount = BN(coinBalances.find(byDenom(asset.denom))?.amount ?? 0)
  const account = useCurrentAccount()
  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      if (!openElement) setOpenElement(1)
      setAmount(value)
      onChange(value)
    },
    [onChange, openElement],
  )

  const handleActionClick = useCallback(() => {
    onAction(amount, amount.isEqualTo(maxAmount))
  }, [amount, maxAmount, onAction])

  return (
    <Modal
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
      <div className='flex items-start flex-1 gap-6 p-6'>
        <Card
          className='flex flex-1 p-4 bg-white/5'
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
            disabled={!amount.toNumber()}
            className='w-full'
            text={actionButtonText}
            rightIcon={<ArrowRight />}
          />
        </Card>
        {account && <AccountSummary account={account} openElement={openElement} />}
      </div>
    </Modal>
  )
}
