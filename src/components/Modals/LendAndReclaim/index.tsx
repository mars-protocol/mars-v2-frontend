import { useState } from 'react'

import useStore from 'store'
import useToggle from 'hooks/useToggle'
import { hardcodedFee } from 'utils/constants'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
import AccountBalanceSettableCoin from 'types/classes/AccountBalanceSettableCoin'

const getAccountChange = (isLend: boolean, value: BigNumber, denom: string): AccountChange => {
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

function LendAndReclaimModal() {
  const lend = useStore((s) => s.lend)
  const reclaim = useStore((s) => s.reclaim)
  const currentAccount = useCurrentAccount()
  const { config, close } = useLendAndReclaimModal()
  const [isConfirming, setIsConfirming] = useToggle()
  const [accountChange, setAccountChange] = useState<AccountChange | undefined>()

  if (!config || !currentAccount) return null

  const { data, action } = config
  const { asset } = data

  const isLendAction = action === 'lend'
  const actionText = isLendAction ? 'Lend' : 'Withdraw'
  const coinBalances = currentAccount[isLendAction ? 'deposits' : 'lends'] ?? []

  const handleAmountChange = (value: BigNumber) => {
    setAccountChange(getAccountChange(isLendAction, value, asset.denom))
  }

  const handleAction = async (value: BigNumber, isMax: boolean) => {
    setIsConfirming(true)

    const coin = new AccountBalanceSettableCoin(asset.denom, value.integerValue().toString(), isMax)
    const options = {
      fee: hardcodedFee,
      accountId: currentAccount.id,
      coin,
    }
    await (isLendAction ? lend : reclaim)(options)

    setIsConfirming(false)
    close()
  }

  return (
    <AssetAmountSelectActionModal
      asset={asset}
      isOpen={true}
      contentHeader={<DetailsHeader data={data} />}
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

export default LendAndReclaimModal
