import classNames from 'classnames'
import { useCallback } from 'react'
import { BN_ZERO } from '../../../../constants/math'
import useAccount from '../../../../hooks/accounts/useAccount'
import useAsset from '../../../../hooks/assets/useAsset'
import useMarket from '../../../../hooks/markets/useMarket'
import useStore from '../../../../store'
import { byDenom } from '../../../../utils/array'
import AssetCampaignCopy from '../../../common/assets/AssetCampaignCopy'
import ModalContentWithSummary from '../../ModalContentWithSummary'
import Header from '../Header'
import ChangeLeverage from './ChangeLeverage'
import Deposit from './Deposit'
import Repay from './Repay'
import Withdraw from './Withdraw'

export default function HlsManageModalController() {
  const modal = useStore((s) => s.hlsManageModal)
  const { data: account } = useAccount(modal?.accountId)
  const collateralAsset = useAsset(modal?.staking.strategy.denoms.deposit || '')
  const market = useMarket(modal?.staking.strategy.denoms.borrow || '')

  if (!modal || !collateralAsset || !market || !account) return null

  return (
    <HlsModal
      account={{ ...account, strategy: modal.staking.strategy } as HlsAccountWithStakingStrategy}
      action={modal.staking.action}
      collateralAsset={collateralAsset}
      borrowMarket={market}
    />
  )
}

interface Props {
  account: HlsAccountWithStakingStrategy
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
