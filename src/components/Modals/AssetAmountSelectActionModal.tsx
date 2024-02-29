import { useCallback, useState } from 'react'
import classNames from 'classnames'

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
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
  asset: Asset
  title: string
  coinBalances: BNCoin[]
  actionButtonText: string
  contentHeader?: JSX.Element
  onClose: () => void
  onChange: (value: BigNumber) => void
  onAction: (value: BigNumber, isMax: boolean) => void
  onDebounce: () => void
}

export default function AssetAmountSelectActionModal(props: Props) {
  const {
    account,
    asset,
    title,
    coinBalances,
    actionButtonText,
    contentHeader = null,
    onClose,
    onChange,
    onAction,
    onDebounce,
  } = props
  const [amount, setAmount] = useState(BN_ZERO)
  const maxAmount = BN(coinBalances.find(byDenom(asset.denom))?.amount ?? 0)
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

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-2 md:px-4'>
          <AssetImage size={24} asset={asset} />
          <Text>{title}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col min-h-[400px]'
    >
      {contentHeader}
      <div
        className={classNames(
          'flex items-start flex-1 p-2 gap-4 flex-wrap',
          'md:p-4 md:gap-6',
          'lg:flex-nowrap lg:p-6',
        )}
      >
        <Card
          className='flex flex-1 w-full p-4 bg-white/5 max-w-screen-full min-w-[200px]'
          contentClassName='gap-6 flex flex-col justify-between h-full'
        >
          <TokenInputWithSlider
            asset={asset}
            onChange={handleAmountChange}
            onDebounce={onDebounce}
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
