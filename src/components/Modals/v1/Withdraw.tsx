import { useCallback, useState } from 'react'

import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  account: Account
}

export default function Withdraw(props: Props) {
  const { account } = props
  const baseAsset = useBaseAsset()
  const modal = useStore((s) => s.v1DepositAndWithdrawModal)
  const asset = modal?.data.asset ?? baseAsset
  const [withdrawAsset, setWithdrawAsset] = useState<BNCoin>(
    BNCoin.fromDenomAndBigNumber(modal?.data.asset.denom ?? baseAsset.denom, BN_ZERO),
  )
  const { computeMaxWithdrawAmount } = useHealthComputer(account)
  const maxWithdrawAmount = computeMaxWithdrawAmount(asset.denom)
  const { simulateWithdraw } = useUpdatedAccount(account)
  const balance = BNCoin.fromDenomAndBigNumber(asset.denom, maxWithdrawAmount)
  const v1Action = useStore((s) => s.v1Action)

  const close = useCallback(() => {
    useStore.setState({ v1DepositAndWithdrawModal: null })
  }, [])

  const handleClick = useCallback(async () => {
    v1Action('withdraw', withdrawAsset)
    close()
  }, [v1Action, withdrawAsset, close])

  const onDebounce = useCallback(() => {
    simulateWithdraw(false, withdrawAsset)
  }, [withdrawAsset, simulateWithdraw])

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      setWithdrawAsset(BNCoin.fromDenomAndBigNumber(asset.denom, value))
    },
    [asset.denom],
  )

  if (!modal) return

  return (
    <AssetAmountSelectActionModal
      account={account}
      asset={asset}
      contentHeader={<DetailsHeader data={modal.data} />}
      coinBalances={[balance]}
      actionButtonText={`Withdraw ${asset.symbol}`}
      title={`Withdraw ${asset.symbol} from the Red Bank`}
      onClose={close}
      onAction={handleClick}
      onChange={handleAmountChange}
      onDebounce={onDebounce}
    />
  )
}
