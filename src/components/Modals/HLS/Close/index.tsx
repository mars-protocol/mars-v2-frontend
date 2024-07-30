import { useCallback } from 'react'

import AccountAlertDialog from 'components/Modals/Account/AccountAlertDialog'
import RepayInfo from 'components/Modals/HLS/Close/RepayInfo'
import SwapInfo from 'components/Modals/HLS/Close/SwapInfo'
import { Callout, CalloutType } from 'components/common/Callout'
import { ArrowRight, Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useHLSClosePositionActions from 'hooks/hls/useHLSClosePositionActions'
import React from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  modal: HlsCloseModal
  collateralAsset: Asset
  debtAsset: Asset
  assets: Asset[]
}

export default function HlsCloseController() {
  const modal = useStore((s) => s.hlsCloseModal)
  const assets = useWhitelistedAssets()

  if (!modal) return null

  const collateralAsset = assets.find(byDenom(modal.staking.strategy.denoms.deposit))
  const debtAsset = assets.find(byDenom(modal.staking.strategy.denoms.borrow))

  if (!collateralAsset || !debtAsset) return null

  return (
    <HlsCloseModal
      modal={modal}
      collateralAsset={collateralAsset}
      debtAsset={debtAsset}
      assets={assets}
    />
  )
}

function HlsCloseModal(props: Props) {
  const { modal, collateralAsset, debtAsset, assets } = props
  const { actions, changes, hasRouteError } = useHLSClosePositionActions({ account: modal.account })
  const closeHlsStakingPosition = useStore((s) => s.closeHlsStakingPosition)

  const closeHlsClosingModal = useCallback(() => {
    useStore.setState({ hlsCloseModal: null })
  }, [])

  if (!actions || !changes) return null

  return (
    <AccountAlertDialog
      title='Close HLS Position'
      content={
        <>
          <div className='flex flex-col w-full gap-2'>
            <Text className='mt-2' size='sm'>
              Current Position
            </Text>
            <AssetBalanceRow
              asset={collateralAsset}
              coin={modal.account.deposits[0]}
              className='p-2 rounded-md bg-white/5'
              hideNames
              small
            />
            <Text size='sm'>The following actions will be performed on closing the position</Text>
          </div>
          <SwapInfo
            changes={changes.swap}
            collateralAsset={collateralAsset}
            debtAsset={debtAsset}
          />
          <RepayInfo repayCoin={changes.repay} debtAsset={debtAsset} />
          {hasRouteError && (
            <Callout type={CalloutType.WARNING} className='mt-8'>
              There was an error fetching the swap route. Without a swapping your collateral to
              repay the debt of the position, you won't be able to close the position. Please try
              again later.
            </Callout>
          )}
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
        </>
      }
      closeHandler={closeHlsClosingModal}
      positiveButton={{
        text: 'Close Position',
        icon: <ArrowRight />,
        onClick: () => {
          closeHlsStakingPosition({ accountId: modal.account.id, actions })
          closeHlsClosingModal()
        },
        disabled: hasRouteError,
      }}
    />
  )
}
