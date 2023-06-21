import { useState } from 'react'

import useStore from 'store'
import useToggle from 'hooks/useToggle'
import { hardcodedFee } from 'utils/constants'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLendAndWithdrawModal from 'hooks/useLendAndWithdrawModal'
import DetailsHeader from 'components/Modals/LendAndWithdraw/DetailsHeader'
import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'

const getLendAndWithdrawAccountChange = (
  isLend: boolean,
  value: BigNumber,
  denom: string,
): AccountChange => {
  const makeCoin = (denom: string, shouldNegate: boolean) => [
    {
      amount: (shouldNegate ? value.negated() : value).toString(),
      denom,
    },
  ]

  return {
    deposits: makeCoin(denom, isLend),
    lends: makeCoin(denom, !isLend),
  }
}

const getOptions = () => {}

function LendAndWithdrawModal() {
  const lend = useStore((s) => s.lend)
  const reclaim = useStore((s) => s.reclaim)
  const currentAccount = useCurrentAccount()
  const { config, close } = useLendAndWithdrawModal()
  const [isConfirming, setIsConfirming] = useToggle()
  const [accountChange, setAccountChange] = useState<AccountChange | undefined>()

  if (!config || !currentAccount) return null

  const { data, action } = config
  const { asset } = data

  const isLendAction = action === 'lend'
  const actionText = isLendAction ? 'Lend' : 'Withdraw'
  const coinBalances = currentAccount[isLendAction ? 'deposits' : 'lends'] ?? []

  const handleAmountChange = (value: BigNumber) => {
    setAccountChange(getLendAndWithdrawAccountChange(isLendAction, value, asset.denom))
  }

  const handleAction = async (value: BigNumber) => {
    setIsConfirming(true)

    const options = {
      fee: hardcodedFee,
      accountId: currentAccount.id,
      coin: {
        denom: asset.denom,
        amount: value.toString(),
      },
    }
    await (isLendAction ? lend : reclaim)(options)

    setIsConfirming(false)
    close()
  }

  return (
    <AssetAmountSelectActionModal
      asset={asset}
      isOpen={true}
      header={<DetailsHeader data={data} />}
      coinBalances={coinBalances}
      actionButtonText={actionText}
      showLoaderInButton={isConfirming}
      accountSummaryChange={accountChange}
      title={`${actionText} ${asset.symbol}`}
      onClose={close}
      onAction={handleAction}
      onChange={handleAmountChange}
    />
  )
}

export default LendAndWithdrawModal
