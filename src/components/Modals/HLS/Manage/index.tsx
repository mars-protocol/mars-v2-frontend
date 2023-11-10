import React, { useCallback } from 'react'

import Header from 'components/Modals/HLS/Header'
import ChangeLeverage from 'components/Modals/HLS/Manage/ChangeLeverage'
import Deposit from 'components/Modals/HLS/Manage/Deposit'
import Repay from 'components/Modals/HLS/Manage/Repay'
import Withdraw from 'components/Modals/HLS/Manage/Withdraw'
import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import useAccount from 'hooks/useAccount'
import useStore from 'store'
import { getAssetByDenom } from 'utils/assets'

export default function HlsManageModalController() {
  const modal = useStore((s) => s.hlsManageModal)
  const { data: account } = useAccount(modal?.accountId)
  const collateralAsset = getAssetByDenom(modal?.staking.strategy.denoms.deposit || '')
  const borrowAsset = getAssetByDenom(modal?.staking.strategy.denoms.borrow || '')

  if (!modal || !collateralAsset || !borrowAsset || !account) return null

  return (
    <HlsModal
      account={{ ...account, strategy: modal.staking.strategy } as HLSAccountWithStrategy}
      action={modal.staking.action}
      collateralAsset={collateralAsset}
      borrowAsset={borrowAsset}
    />
  )
}

interface Props {
  account: HLSAccountWithStrategy
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

function HlsModal(props: Props) {
  const updatedAccount = useStore((s) => s.updatedAccount)
  function handleClose() {
    useStore.setState({ hlsManageModal: null })
  }

  const ContentComponent = useCallback(() => {
    switch (props.action) {
      case 'deposit':
        return <Deposit {...props} />
      case 'withdraw':
        return <Withdraw {...props} />
      case 'repay':
        return <Repay {...props} />
      case 'leverage':
        return <ChangeLeverage {...props} />
      default:
        return null
    }
  }, [props])

  return (
    <ModalContentWithSummary
      account={props.account}
      header={
        <Header
          action={props.action}
          primaryAsset={props.collateralAsset}
          secondaryAsset={props.borrowAsset}
        />
      }
      onClose={handleClose}
      content={<ContentComponent />}
      isContentCard
    />
  )
}
