import classNames from 'classnames'
import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import Header from 'components/Modals/HLS/Header'
import ChangeLeverage from 'components/Modals/HLS/Manage/ChangeLeverage'
import Deposit from 'components/Modals/HLS/Manage/Deposit'
import Repay from 'components/Modals/HLS/Manage/Repay'
import Withdraw from 'components/Modals/HLS/Manage/Withdraw'
import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/accounts/useAccount'
import useAsset from 'hooks/assets/useAsset'
import useMarket from 'hooks/markets/useMarket'
import { useCallback } from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'

export default function HlsManageModalController() {
  const modal = useStore((s) => s.hlsManageModal)
  const { data: account } = useAccount(modal?.accountId)
  const collateralAsset = useAsset(modal?.staking.strategy.denoms.deposit || '')
  const market = useMarket(modal?.staking.strategy.denoms.borrow || '')

  if (!modal || !collateralAsset || !market || !account) return null

  return (
    <HlsModal
      account={{ ...account, strategy: modal.staking.strategy } as HLSAccountWithStrategy}
      action={modal.staking.action}
      collateralAsset={collateralAsset}
      borrowMarket={market}
    />
  )
}

interface Props {
  account: HLSAccountWithStrategy
  action: HlsStakingManageAction
  borrowMarket: Market
  collateralAsset: Asset
}

function HlsModal(props: Props) {
  const updatedAccount = useStore((s) => s.updatedAccount)
  const showCampaignHeader =
    props.collateralAsset.campaigns.filter((campaign) => campaign.type === 'points_with_multiplier')
      .length > 0
  const collateralAmount =
    updatedAccount?.deposits.find(byDenom(props.collateralAsset.denom))?.amount ?? BN_ZERO
  const handleClose = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
  }, [])

  return (
    <ModalContentWithSummary
      account={props.account}
      isHls
      header={
        <div className='flex flex-wrap w-full'>
          <Header
            action={props.action}
            primaryAsset={props.collateralAsset}
            secondaryAsset={props.borrowMarket.asset}
          />
          {showCampaignHeader &&
            props.collateralAsset.campaigns.map((campaign, index) => {
              if (campaign.type !== 'points_with_multiplier') return null
              return (
                <div
                  className={classNames(
                    'w-full p-2 flex items-center justify-center',
                    campaign?.bgClassNames ?? 'bg-white/50',
                  )}
                  key={index}
                >
                  <AssetCampaignCopy
                    asset={props.collateralAsset}
                    textClassName='text-white'
                    size='sm'
                    campaign={campaign}
                    amount={collateralAmount}
                    account={updatedAccount}
                    withLogo
                  />
                </div>
              )
            })}
        </div>
      }
      onClose={handleClose}
      content={<ContentComponent {...props} />}
      isContentCard
    />
  )
}

function ContentComponent(props: Props) {
  const { action } = props

  if (action === 'deposit') return <Deposit {...props} />
  if (action === 'withdraw') return <Withdraw {...props} />
  if (action === 'repay') return <Repay {...props} />
  if (action === 'leverage') return <ChangeLeverage {...props} />
  return null
}
