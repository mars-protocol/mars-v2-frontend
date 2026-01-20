import { useCallback, useMemo, useState } from 'react'

import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
}

export default function Withdraw(props: Props) {
  const { account } = props
  const baseAsset = useBaseAsset()
  const chainConfig = useChainConfig()
  const modal = useStore((s) => s.v1DepositAndWithdrawModal)
  const asset = modal?.data.asset ?? baseAsset
  const [withdrawAsset, setWithdrawAsset] = useState<BNCoin>(
    BNCoin.fromDenomAndBigNumber(modal?.data.asset.denom ?? baseAsset.denom, BN_ZERO),
  )
  const isDeprecated = asset.isDeprecated
  const isWithdrawalDisabled = useMemo(
    () => chainConfig.disabledWithdrawals?.includes(asset.denom) ?? false,
    [chainConfig.disabledWithdrawals, asset.denom],
  )
  const { computeMaxWithdrawAmount } = useHealthComputer(account)
  const maxWithdrawAmount = isDeprecated
    ? (account?.lends?.find(byDenom(asset.denom))?.amount ?? BN_ZERO)
    : computeMaxWithdrawAmount(asset.denom)
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

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      const newWithdrawAsset = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      setWithdrawAsset(newWithdrawAsset)

      simulateWithdraw(false, newWithdrawAsset)
    },
    [asset.denom, simulateWithdraw],
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
      checkForCampaign
      disabledMessage={
        isWithdrawalDisabled ? 'The withdrawal of this asset is temporarily disabled.' : undefined
      }
    />
  )
}
