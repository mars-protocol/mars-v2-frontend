import Header from 'components/Modals/HLS/Header'
import ChangeLeverage from 'components/Modals/HLS/Manage/ChangeLeverage'
import Deposit from 'components/Modals/HLS/Manage/Deposit'
import Repay from 'components/Modals/HLS/Manage/Repay'
import Withdraw from 'components/Modals/HLS/Manage/Withdraw'
import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import useAccount from 'hooks/accounts/useAccount'
import useAsset from 'hooks/assets/useAsset'
import useMarket from 'hooks/markets/useMarket'
import useStore from 'store'

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
  function handleClose() {
    useStore.setState({ hlsManageModal: null })
  }

  return (
    <ModalContentWithSummary
      account={props.account}
      isHls
      header={
        <Header
          action={props.action}
          primaryAsset={props.collateralAsset}
          secondaryAsset={props.borrowMarket.asset}
        />
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
