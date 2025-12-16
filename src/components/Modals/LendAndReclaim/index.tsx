import { useCallback, useMemo, useState } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLendAndReclaimModal from 'hooks/common/useLendAndReclaimModal'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'

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
  const chainConfig = useChainConfig()
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
  const isWithdrawalDisabled = useMemo(
    () => !isLendAction && (chainConfig.disabledWithdrawals?.includes(asset.denom) ?? false),
    [chainConfig.disabledWithdrawals, asset.denom, isLendAction],
  )

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      const newCoin = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      setCoin(newCoin)
      simulateLending(isLendAction, newCoin)
    },
    [asset.denom, isLendAction, simulateLending],
  )

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
      deductFee={isLendAction}
      disabledMessage={
        isWithdrawalDisabled ? 'The withdrawal of this asset is temporarily disabled.' : undefined
      }
    />
  )
}

export default LendAndReclaimModalController
