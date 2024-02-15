import { useCallback, useEffect, useMemo, useState } from 'react'

import WalletBridges from 'components/Wallet/WalletBridges'
import { BN_ZERO } from 'constants/math'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'
import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'

interface Props {
  account: Account
}

export default function Deposit(props: Props) {
  const { account } = props
  const baseAsset = useBaseAsset()
  const modal = useStore((s) => s.v1DepositAndWithdrawModal)
  const address = useStore((s) => s.address)
  const asset = modal?.data.asset ?? baseAsset
  const [fundingAsset, setFundingAsset] = useState<BNCoin>(
    BNCoin.fromDenomAndBigNumber(modal?.data.asset.denom ?? baseAsset.denom, BN_ZERO),
  )
  const { data: walletBalances } = useWalletBalances(address)
  const { simulateDeposits } = useUpdatedAccount(account)
  const balance = useCurrentWalletBalance(asset.denom)
  const v1Action = useStore((s) => s.v1Action)

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  const close = useCallback(() => {
    useStore.setState({ v1DepositAndWithdrawModal: null })
  }, [])

  const handleClick = useCallback(async () => {
    v1Action('deposit', fundingAsset)
    close()
  }, [v1Action, fundingAsset, close])

  useEffect(() => {
    if (BN(baseBalance).isLessThan(defaultFee.amount[0].amount)) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
    }
  }, [baseBalance])

  const onDebounce = useCallback(() => {
    simulateDeposits('lend', [fundingAsset])
  }, [fundingAsset, simulateDeposits])

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      setFundingAsset(BNCoin.fromDenomAndBigNumber(asset.denom, value))
    },
    [asset.denom],
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
      onDebounce={onDebounce}
    />
  )
}
