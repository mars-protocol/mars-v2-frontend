import { useCallback, useState } from 'react'

import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  account: Account
}

export default function Deposit(props: Props) {
  const { account } = props
  const baseAsset = useBaseAsset()
  const modal = useStore((s) => s.v1DepositAndWithdrawModal)
  const asset = modal?.data.asset ?? baseAsset
  const [fundingAsset, setFundingAsset] = useState<BNCoin>(
    BNCoin.fromDenomAndBigNumber(modal?.data.asset.denom ?? baseAsset.denom, BN_ZERO),
  )
  const { simulateDeposits } = useUpdatedAccount(account)
  const balance = useCurrentWalletBalance(asset.denom)
  const v1Action = useStore((s) => s.v1Action)

  const close = useCallback(() => {
    useStore.setState({ v1DepositAndWithdrawModal: null })
  }, [])

  const handleClick = useCallback(async () => {
    v1Action('deposit', fundingAsset)
    close()
  }, [v1Action, fundingAsset, close])

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      const newFundingAsset = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      setFundingAsset(newFundingAsset)
      simulateDeposits('lend', [newFundingAsset])
    },
    [asset.denom, simulateDeposits],
  )

  if (!modal) return

  return (
    <AssetAmountSelectActionModal
      account={account}
      asset={asset}
      contentHeader={<DetailsHeader data={modal.data} />}
      coinBalances={balance ? [BNCoin.fromCoin(balance)] : []}
      actionButtonText={`Deposit ${asset.symbol}`}
      title={`Deposit ${asset.symbol} into the Red Bank`}
      onClose={close}
      onAction={handleClick}
      onChange={handleAmountChange}
      checkForCampaign
      deductFee={true}
    />
  )
}
