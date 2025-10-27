import classNames from 'classnames'
import { ReactElement, useCallback, useMemo, useState } from 'react'

import Modal from 'components/Modals/Modal'
import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import AssetImage from 'components/common/assets/AssetImage'
import { BN_ZERO } from 'constants/math'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN, mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  account: Account
  asset: Asset
  title: string
  coinBalances: BNCoin[]
  actionButtonText: string
  contentHeader?: ReactElement
  checkForCampaign?: boolean
  onClose: () => void
  onChange: (value: BigNumber) => void
  onAction: (value: BigNumber, isMax: boolean) => void
  deductFee?: boolean
}

export default function AssetAmountSelectActionModal(props: Props) {
  const {
    account,
    asset,
    title,
    coinBalances,
    actionButtonText,
    checkForCampaign,
    contentHeader = null,
    onClose,
    onChange,
    onAction,
    deductFee,
  } = props
  const [amount, setAmount] = useState(BN_ZERO)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const maxAmount = BN(coinBalances.find(byDenom(asset.denom))?.amount ?? 0)
  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      setAmount(value)
      onChange(value)
    },
    [onChange],
  )

  const updatedAmount = useMemo(() => {
    const deposits = updatedAccount?.deposits.find(byDenom(asset.denom))
    const lends = updatedAccount?.lends.find(byDenom(asset.denom))
    const position = mergeBNCoinArrays(deposits ? [deposits] : [], lends ? [lends] : [])

    return position[0]?.amount ?? BN_ZERO
  }, [asset.denom, updatedAccount])

  const showCampaignHeader = useMemo(() => {
    const campaignTypes = asset.campaigns.map((campaign) => campaign.type) ?? []
    return campaignTypes.includes('points_with_multiplier') && checkForCampaign
  }, [asset.campaigns, checkForCampaign])

  const handleActionClick = useCallback(() => {
    onAction(amount, amount.isEqualTo(maxAmount))
  }, [amount, maxAmount, onAction])

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-2 md:px-4'>
          <AssetImage className='w-6 h-6' asset={asset} />
          <Text>{title}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col min-h-[400px]'
    >
      {contentHeader}
      {showCampaignHeader &&
        asset.campaigns.map((campaign, index) => {
          if (campaign.type === 'points_with_multiplier')
            return (
              <div
                className={classNames(
                  'w-full p-2 flex items-center justify-center',
                  campaign?.bgClassNames ?? 'bg-white/50',
                )}
                key={index}
              >
                <AssetCampaignCopy
                  campaign={campaign}
                  asset={asset}
                  textClassName='text-white'
                  size='sm'
                  amount={updatedAmount}
                  withLogo
                />
              </div>
            )
        })}
      <div className='flex items-start flex-1 p-2 gap-1 flex-wrap bg-body'>
        <Card
          className='flex flex-1 w-full p-4 bg-surface-dark max-w-screen-full min-w-[200px]'
          contentClassName='gap-6 flex flex-col justify-between h-full min-h-[300px]'
        >
          <TokenInputWithSlider
            asset={asset}
            onChange={handleAmountChange}
            amount={amount}
            max={maxAmount}
            hasSelect
            maxText='Max'
            warningMessages={[]}
            deductFee={deductFee}
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
