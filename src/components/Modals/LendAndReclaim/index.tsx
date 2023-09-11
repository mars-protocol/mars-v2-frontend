import { useCallback } from 'react'

import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

function LendAndReclaimModalController() {
  const currentAccount = useCurrentAccount()
  const { config } = useLendAndReclaimModal()

  if (!config || !currentAccount) return null

  return <LendAndReclaimModal currentAccount={currentAccount} config={config} />
}

interface Props {
  currentAccount: Account
  config: LendAndReclaimModalConfig
}

function LendAndReclaimModal({ currentAccount, config }: Props) {
  const lend = useStore((s) => s.lend)
  const reclaim = useStore((s) => s.reclaim)
  const { close } = useLendAndReclaimModal()
  const pendingTransaction = useStore((s) => s.pendingTransaction)
  const { simulateLending } = useUpdatedAccount(currentAccount)

  const { data, action } = config
  const { asset } = data

  const isLendAction = action === 'lend'
  const actionText = isLendAction ? 'Lend' : 'Withdraw'
  const coinBalances = currentAccount[isLendAction ? 'deposits' : 'lends'] ?? []

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      simulateLending(isLendAction, coin)
    },
    [asset.denom, isLendAction, simulateLending],
  )

  const handleAction = useCallback(
    async (value: BigNumber, isMax: boolean) => {
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      const options = {
        accountId: currentAccount.id,
        coin,
        isMax,
      }
      await (isLendAction ? lend : reclaim)(options)
      close()
    },
    [asset.denom, close, currentAccount.id, isLendAction, lend, reclaim],
  )
  return (
    <AssetAmountSelectActionModal
      asset={asset}
      contentHeader={<DetailsHeader data={data} />}
      coinBalances={coinBalances}
      actionButtonText={actionText}
      showProgressIndicator={pendingTransaction}
      title={`${actionText} ${asset.symbol}`}
      onClose={close}
      onAction={handleAction}
      onChange={handleAmountChange}
    />
  )
}

export default LendAndReclaimModalController
