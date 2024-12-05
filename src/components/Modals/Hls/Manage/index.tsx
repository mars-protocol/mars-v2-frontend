import { useCallback, useMemo } from 'react'

import classNames from 'classnames'
import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import Header from 'components/Modals/Hls/Header'
import ChangeLeverage from 'components/Modals/Hls/Manage/ChangeLeverage'
import Deposit from 'components/Modals/Hls/Manage/Deposit'
import Repay from 'components/Modals/Hls/Manage/Repay'
import Withdraw from 'components/Modals/Hls/Manage/Withdraw'
import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/accounts/useAccount'
import useAsset from 'hooks/assets/useAsset'
import useAssets from 'hooks/assets/useAssets'
import useMarket from 'hooks/markets/useMarket'
import useStore from 'store'
import { getAccountDebtValue, getAccountTotalValue } from 'utils/accounts'
import { byDenom } from 'utils/array'

export default function HlsManageModalController() {
  const modal = useStore((s) => s.hlsManageModal)
  const { data: assets } = useAssets()
  const { data: account, isLoading } = useAccount(modal?.accountId)
  const isFarming = !!modal?.farming
  const isStaking = !!modal?.staking

  const collateralAsset = useAsset(
    isFarming
      ? modal?.farming?.farm.denoms.lp || ''
      : modal?.staking?.strategy.denoms.deposit || '',
  )
  const market = useMarket(
    isFarming
      ? modal?.farming?.borrowAsset.denom || ''
      : modal?.staking?.strategy.denoms.borrow || '',
  )

  const usedAccount = useMemo(() => {
    if (isStaking) return { ...account, strategy: modal.staking?.strategy }
    if (isFarming && modal.farming) {
      return {
        ...modal.farming.account,
        strategy: {
          maxLTV: modal.farming.farm.ltv.max,
          maxLeverage: modal.farming.maxLeverage,
          apy: modal.farming.farm.apy,
          denoms: {
            deposit: modal.farming.farm.denoms.lp,
            borrow: modal.farming.borrowAsset.denom,
          },
          depositCap: modal.farming.farm.cap?.max,
        },
        values: {
          net: modal.farming.netValue,
          debt: getAccountDebtValue(modal.farming.account, assets),
          total: getAccountTotalValue(modal.farming.account, assets),
        },
        leverage: modal.farming.leverage,
      }
    }
    return null
  }, [isStaking, account, modal, isFarming, assets])

  if (
    (!isFarming && !isStaking) ||
    isLoading ||
    !modal ||
    !collateralAsset ||
    !market ||
    !usedAccount
  )
    return null

  return (
    <HlsModal
      account={usedAccount as HlsAccountWithStrategy}
      action={modal.action}
      collateralAsset={collateralAsset}
      borrowMarket={market}
      isFarming={isFarming}
    />
  )
}

interface Props {
  account: HlsAccountWithStrategy
  action: HlsStakingManageAction
  borrowMarket: Market
  collateralAsset: Asset
  isFarming: boolean
}

function HlsModal(props: Props) {
  const updatedAccount = useStore((s) => s.updatedAccount)
  const showCampaignHeader =
    props.collateralAsset.campaigns.filter((campaign) => campaign.type === 'points_with_multiplier')
      .length > 0
  const collateralAmount = props.isFarming
    ? (updatedAccount?.stakedAstroLps.find(byDenom(props.collateralAsset.denom))?.amount ?? BN_ZERO)
    : (updatedAccount?.deposits.find(byDenom(props.collateralAsset.denom))?.amount ?? BN_ZERO)
  const handleClose = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
  }, [])

  return (
    <ModalContentWithSummary
      account={props.account}
      header={
        <div className='flex flex-wrap w-full'>
          <Header
            action={props.action}
            primaryAsset={props.collateralAsset}
            secondaryAsset={props.borrowMarket.asset}
            isFarming={props.isFarming}
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
