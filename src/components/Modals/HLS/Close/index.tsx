import { useCallback } from 'react'

import AccountDeleteAlertDialog from 'components/Modals/Account/AccountDeleteAlertDialog'
import { ArrowRight, Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useCloseHlsStakingPosition from 'hooks/hls/useClosePositionActions'
import React from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  modal: HlsCloseModal
  collateralAsset: Asset
  debtAsset: Asset
  assets: Asset[]
}

interface SwapAndRepayProps {
  changes: HlsClosingChanges
  collateralAsset: Asset
  debtAsset: Asset
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
  const { actions, changes } = useCloseHlsStakingPosition({ account: modal.account })
  const closeHlsStakingPosition = useStore((s) => s.closeHlsStakingPosition)

  const closeHlsClosingModal = useCallback(() => {
    useStore.setState({ hlsCloseModal: null })
  }, [])

  if (!actions || !changes) return null

  return (
    <AccountDeleteAlertDialog
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
          <SwapAndRepay changes={changes} collateralAsset={collateralAsset} debtAsset={debtAsset} />
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
                        className='p-2 rounded-md bg-white/5 text-profit'
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
      }}
    />
  )
}

function SwapAndRepay(props: SwapAndRepayProps) {
  const { changes, collateralAsset, debtAsset } = props

  if (!changes.swap || !changes.repay) return null
  return (
    <div className='flex flex-col w-full gap-2'>
      <Text className='mt-6' size='sm'>
        Swap
      </Text>
      <Text className='text-white/50' size='xs'>
        A part of the total collateral will be swapped to repay the borrowed funds
      </Text>
      <div className='flex items-center gap-2'>
        <AssetBalanceRow
          asset={collateralAsset}
          coin={changes.swap.coinIn}
          className='p-2 rounded-md bg-white/5 text-loss'
          hideNames
          small
        />
        <ArrowRight className='w-10 h-10 text-white' />
        <AssetBalanceRow
          asset={debtAsset}
          coin={changes.swap.coinOut}
          className='p-2 rounded-md bg-white/5 text-profit'
          hideNames
          small
        />
      </div>
      <Text className='mt-6' size='sm'>
        Repay
      </Text>
      <Text className='text-white/50' size='xs'>
        To bring the leverage down to 1x, the borrowed funds will be repaid
      </Text>
      <AssetBalanceRow
        asset={debtAsset}
        coin={changes.repay}
        className='p-2 rounded-md bg-white/5 text-loss'
        hideNames
        small
      />
    </div>
  )
}
