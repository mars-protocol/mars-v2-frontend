import { useCallback, useState } from 'react'

import useStore from 'store'
import useToggle from 'hooks/useToggle'
import { hardcodedFee } from 'utils/constants'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import DetailsHeader from 'components/Modals/LendAndReclaim/DetailsHeader'
import AssetAmountSelectActionModal from 'components/Modals/AssetAmountSelectActionModal'
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
  const [isConfirming, setIsConfirming] = useToggle()
  const [accountChange, setAccountChange] = useState<AccountChange | undefined>()

  const { data, action } = config
  const { asset } = data

  const isLendAction = action === 'lend'
  const actionText = isLendAction ? 'Lend' : 'Withdraw'
  const coinBalances = currentAccount[isLendAction ? 'deposits' : 'lends'] ?? []

  const handleAmountChange = useCallback(
    (value: BigNumber) => {
      setAccountChange(getAccountChange(isLendAction, value, asset.denom))
    },
    [asset.denom, isLendAction],
  )

  const handleAction = useCallback(
    async (value: BigNumber, isMax: boolean) => {
      setIsConfirming(true)

      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, value)
      const options = {
        fee: hardcodedFee,
        accountId: currentAccount.id,
        coin,
        isMax,
      }
      await (isLendAction ? lend : reclaim)(options)

      setIsConfirming(false)
      close()
    },
    [asset.denom, close, currentAccount.id, isLendAction, lend, reclaim, setIsConfirming],
  )

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

export default LendAndReclaimModalController
