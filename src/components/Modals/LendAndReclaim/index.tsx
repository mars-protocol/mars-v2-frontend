import { useCallback, useState } from 'react'

import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useLendAndReclaimModal from 'hooks/common/useLendAndReclaimModal'
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
  const account = useCurrentAccount()
  const lend = useStore((s) => s.lend)
  const reclaim = useStore((s) => s.reclaim)
  const { close } = useLendAndReclaimModal()
  const { simulateLending } = useUpdatedAccount(currentAccount)
  const [coin, setCoin] = useState<BNCoin>()

  const { data, action } = config
  const { asset } = data

  const isLendAction = action === 'lend'
  const actionText = isLendAction ? 'Lend' : 'Unlend'
  const coinBalances = currentAccount[isLendAction ? 'deposits' : 'lends'] ?? []

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      setCoin(BNCoin.fromDenomAndBigNumber(asset.denom, value))
    },
    [asset.denom],
  )

  const onDebounce = useCallback(() => {
    if (!coin) return
    simulateLending(isLendAction, coin)
  }, [coin, isLendAction, simulateLending])

  const handleAction = useCallback(
    (value: BigNumber, isMax: boolean) => {
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      const options = {
        accountId: currentAccount.id,
        coin,
        isMax,
      }
      if (isLendAction) {
        lend(options)
      } else {
        reclaim(options)
      }
      close()
    },
    [asset.denom, close, currentAccount.id, isLendAction, lend, reclaim],
  )
  if (!account) return null

  return (
    <AssetAmountSelectActionModal
      account={account}
      asset={asset}
      contentHeader={<DetailsHeader data={data} />}
      coinBalances={coinBalances}
      actionButtonText={actionText}
      title={`${actionText} ${asset.symbol}`}
      onClose={close}
      onAction={handleAction}
      onChange={handleAmountChange}
      onDebounce={onDebounce}
    />
  )
}

export default LendAndReclaimModalController
