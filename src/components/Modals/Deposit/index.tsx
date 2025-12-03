import { useCallback, useState } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useDepositModal from 'hooks/common/useDepositModal'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'

function DepositModalController() {
  const currentAccount = useCurrentAccount()
  const { config } = useDepositModal()

  if (!config || !currentAccount) return null

  return <DepositModal currentAccount={currentAccount} config={config} />
}

interface Props {
  currentAccount: Account
  config: DepositModalConfig
}

function DepositModal({ currentAccount, config }: Props) {
  const account = useCurrentAccount()
  const depositSingle = useStore((s) => s.depositSingle)
  const depositAndLend = useStore((s) => s.depositAndLend)
  const { close } = useDepositModal()
  const { simulateDeposits } = useUpdatedAccount(currentAccount)

  const { data, action } = config
  const { asset } = data

  const isDepositAndLend = action === 'deposit-and-lend'
  const actionText = isDepositAndLend ? 'Deposit and Lend' : 'Deposit'

  const walletBalance = useCurrentWalletBalance(asset.denom)
  const coinBalances = walletBalance ? [new BNCoin(walletBalance)] : []

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      const newCoin = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      simulateDeposits(isDepositAndLend ? 'lend' : 'deposit', [newCoin])
    },
    [asset.denom, isDepositAndLend, simulateDeposits],
  )

  const handleAction = useCallback(
    (value: BigNumber) => {
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      const options = {
        accountId: currentAccount.id,
        coin,
      }
      if (isDepositAndLend) {
        depositAndLend(options)
      } else {
        depositSingle(options)
      }
      close()
    },
    [asset.denom, close, currentAccount.id, isDepositAndLend, depositAndLend, depositSingle],
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
      deductFee={true}
    />
  )
}

export default DepositModalController
