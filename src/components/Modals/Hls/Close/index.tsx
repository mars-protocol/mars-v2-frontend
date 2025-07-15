import { useCallback } from 'react'

import AccountAlertDialog from 'components/Modals/Account/AccountAlertDialog'
import RepayInfo from 'components/Modals/Hls/Close/RepayInfo'
import SwapInfo from 'components/Modals/Hls/Close/SwapInfo'
import { Callout, CalloutType } from 'components/common/Callout'
import { ArrowRight, Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import useAssets from 'hooks/assets/useAssets'
import useHlsCloseFarmingPositionActions from 'hooks/hls/useHlsCloseFarmingPositionActions'
import useHlsCloseStakingPositionActions from 'hooks/hls/useHlsCloseStakingPositionActions'
import React from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getAstroLpCoinsFromShares } from 'utils/astroLps'

interface Props {
  modal: HlsCloseModal
  collateralAsset: Asset
  debtAsset: Asset
  assets: Asset[]
}

interface FarmingProps {
  hlsFarm: DepositedHlsFarm
  debtAsset: Asset
  assets: Asset[]
}

interface ClosingDialogProps {
  changes: HlsClosingChanges
  collateralAsset: Asset
  debtAsset: Asset
  currentPosition: BNCoin[]
  isFarming: boolean
  assets: Asset[]
  isLoadingRoute: boolean
}

export default function HlsCloseController() {
  const modal = useStore((s) => s.hlsCloseModal)
  const { data: assets } = useAssets()
  const isFarming = !!modal?.farming
  const isStaking = !!modal?.staking

  if (!modal) return null

  const collateralAsset = assets.find(
    byDenom(
      isFarming
        ? modal.farming?.farm.denoms.lp || ''
        : modal.staking?.strategy.denoms.deposit || '',
    ),
  )
  const debtAsset = assets.find(
    byDenom(
      isFarming
        ? modal.farming?.borrowAsset.denom || ''
        : modal.staking?.strategy.denoms.borrow || '',
    ),
  )

  if (!collateralAsset || !debtAsset) return null

  if (isStaking && modal.staking)
    return (
      <HlsCloseStakingModal
        modal={modal}
        collateralAsset={collateralAsset}
        debtAsset={debtAsset}
        assets={assets}
      />
    )

  if (isFarming && modal.farming)
    return <HlsCloseFarmingModal hlsFarm={modal.farming} debtAsset={debtAsset} assets={assets} />

  return null
}

function HlsCloseStakingModal(props: Props) {
  const { modal, collateralAsset, debtAsset, assets } = props
  const { actions, changes, isLoadingRoute } = useHlsCloseStakingPositionActions({
    account: modal.account as HlsAccountWithStrategy,
  })
  const closeHlsPosition = useStore((s) => s.closeHlsPosition)

  const closeHlsClosingModal = useCallback(() => {
    useStore.setState({ hlsCloseModal: null })
  }, [])

  if (!actions || !changes) return null

  return (
    <AccountAlertDialog
      title='Close HLS Staking Position'
      content={
        <HlsClosingDialogContent
          currentPosition={[modal.account.deposits[0]]}
          changes={changes}
          collateralAsset={collateralAsset}
          debtAsset={debtAsset}
          assets={assets}
          isFarming={false}
          isLoadingRoute={isLoadingRoute}
        />
      }
      closeHandler={closeHlsClosingModal}
      positiveButton={{
        text: 'Close Position',
        icon: <ArrowRight />,
        onClick: () => {
          closeHlsPosition({ accountId: modal.account.id, actions })
          closeHlsClosingModal()
        },
        disabled: isLoadingRoute,
      }}
    />
  )
}

function HlsCloseFarmingModal(props: FarmingProps) {
  const { hlsFarm, debtAsset, assets } = props
  const { actions, changes, isLoadingRoute } = useHlsCloseFarmingPositionActions({
    hlsFarm,
  })
  const currentPosition = getAstroLpCoinsFromShares(
    hlsFarm.account.stakedAstroLps[0],
    hlsFarm.farm,
    assets,
  )
  const collateralPartOfShares = currentPosition.filter(
    (share) => share.denom !== debtAsset.denom,
  )[0]
  const collateralAsset = assets.find(byDenom(collateralPartOfShares.denom))

  const closeHlsPosition = useStore((s) => s.closeHlsPosition)

  const closeHlsClosingModal = useCallback(() => {
    useStore.setState({ hlsCloseModal: null })
  }, [])

  if (!actions || !changes || !collateralAsset) return null

  return (
    <AccountAlertDialog
      title='Close HLS Farming Position'
      content={
        <HlsClosingDialogContent
          currentPosition={currentPosition}
          changes={changes}
          collateralAsset={collateralAsset}
          debtAsset={debtAsset}
          assets={assets}
          isLoadingRoute={isLoadingRoute}
          isFarming
        />
      }
      closeHandler={closeHlsClosingModal}
      positiveButton={{
        text: 'Close Position',
        icon: <ArrowRight />,
        onClick: () => {
          closeHlsPosition({ accountId: hlsFarm.account.id, actions })
          closeHlsClosingModal()
        },
        disabled: isLoadingRoute,
      }}
    />
  )
}

function HlsClosingDialogContent(props: ClosingDialogProps) {
  const { changes, collateralAsset, debtAsset, currentPosition, isFarming, isLoadingRoute } = props
  const { data: assets } = useAssets()
  return (
    <>
      <div className='flex flex-col w-full gap-2'>
        <Text className='mt-2' size='sm'>
          Current Position
        </Text>
        {isFarming ? (
          <div className='flex items-center gap-2'>
            {currentPosition.map((coin, index) => {
              const asset = assets.find(byDenom(coin.denom))
              if (!asset) return null
              return (
                <div className='flex w-1/2' key={index}>
                  <AssetBalanceRow
                    asset={asset}
                    coin={coin}
                    className='p-2 rounded-md bg-white/5'
                    hideNames
                    small
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <AssetBalanceRow
            asset={collateralAsset}
            coin={currentPosition[0]}
            className='p-2 rounded-md bg-white/5'
            hideNames
            small
          />
        )}
        <Text size='sm'>The following actions will be performed on closing the position</Text>
      </div>
      <SwapInfo
        changes={changes.swap}
        collateralAsset={collateralAsset}
        debtAsset={debtAsset}
        isLoadingRoute={isLoadingRoute}
      />
      <RepayInfo repayCoin={changes.repay} debtAsset={debtAsset} isLoadingRoute={isLoadingRoute} />
      {isLoadingRoute ? (
        <Callout type={CalloutType.LOADING} className='mt-8'>
          Loading Swap-Route...
        </Callout>
      ) : (
        <div className='flex flex-col w-full gap-2 mt-8'>
          <Text className='font-bold' size='sm'>
            Refund
          </Text>
          <Text size='xs'>These funds will be sent to your wallet</Text>
          <div className='flex flex-col w-full gap-2 py-2'>
            <div className='flex items-center gap-2'>
              {changes.refund.map((coin, index) => {
                const asset = assets.find(byDenom(coin.denom))
                if (!asset) return null
                return (
                  <React.Fragment key={index}>
                    <AssetBalanceRow
                      asset={asset}
                      coin={coin}
                      className='p-2 rounded-md bg-white/5'
                      hideNames
                      small
                    />
                    {index < changes.refund.length - 1 && <Plus className='w-6 h-6' />}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      )}
      {changes.rewards && changes.rewards.length > 0 && (
        <div className='flex flex-col w-full gap-2 mt-8'>
          <Text className='font-bold' size='sm'>
            Rewards
          </Text>
          <Text size='xs'>These rewards will be claimed and sent to your wallet</Text>
          <div className='flex flex-wrap items-center w-full max-w-full gap-2 py-2'>
            {changes.rewards.map((coin, index) => {
              const asset = assets.find(byDenom(coin.denom))
              if (!asset) return null
              return (
                <div className='flex basis-[calc(50%-4px)]' key={index}>
                  <AssetBalanceRow
                    asset={asset}
                    coin={coin}
                    className='p-2 rounded-md bg-white/5'
                    hideNames
                    tiny
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
