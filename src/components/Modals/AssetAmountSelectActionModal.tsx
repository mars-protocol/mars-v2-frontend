import { useCallback, useState } from 'react'

import Modal from 'components/Modals/Modal'
import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import AssetImage from 'components/common/assets/AssetImage'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset
  title: string
  coinBalances: BNCoin[]
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
  const maxAmount = BN(coinBalances.find(byDenom(asset.denom))?.amount ?? 0)
  const account = useCurrentAccount()
  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      setAmount(value)
      onChange(value)
    },
    [onChange],
  )

  const handleActionClick = useCallback(() => {
    onAction(amount, amount.isEqualTo(maxAmount))
  }, [amount, maxAmount, onAction])

  if (!account) return
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
            warningMessages={[]}
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
        <AccountSummaryInModal account={account} />
      </div>
    </Modal>
  )
}
