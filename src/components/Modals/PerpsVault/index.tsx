import { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import { Callout } from 'components/common/Callout'
import { ArrowRight } from 'components/common/Icons'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import { Header } from 'components/Modals/PerpsVault/Header'
import { SubHeader } from 'components/Modals/PerpsVault/SubHeader'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAsset from 'hooks/assets/useAsset'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useStore from 'store'
import { BN } from 'utils/helpers'

export default function PerpsVaultModal() {
  const modal = useStore((s) => s.perpsVaultModal)
  const account = useCurrentAccount()
  const [amount, setAmount] = useState(BN(0))
  const [isConfirming, setIsConfirming] = useState(false)

  const { data: perpsVault } = usePerpsVault()
  const asset = useAsset(perpsVault?.denom || '')

  const [amountInDeposits, amountInLends, maxAmount] = useMemo(() => {
    if (!account) return [BN(0), BN(0), BN(0)]

    const amountInDeposits =
      account.deposits.find((d) => d.denom === perpsVault?.denom)?.amount || BN(0)
    const amountInLends = account.lends.find((d) => d.denom === perpsVault?.denom)?.amount || BN(0)

    return [amountInDeposits, amountInLends, amountInDeposits.plus(amountInLends)]
  }, [account, perpsVault?.denom])

  const onClose = useCallback(() => useStore.setState({ perpsVaultModal: null }), [])
  const handleClick = useCallback(async () => {
    if (!account || !perpsVault) return
    setIsConfirming(true)

    if (modal?.type === 'deposit') {
      const amountFromDeposits = amount.isLessThanOrEqualTo(amountInDeposits)
        ? amount
        : amountInDeposits
      const amountFromLends = amount.isGreaterThan(amountInDeposits)
        ? amount.minus(amountInDeposits)
        : BN(0)
      await useStore.getState().depositIntoPerpsVault({
        accountId: account.id,
        denom: perpsVault.denom,
        ...(amountFromDeposits.isPositive() ? { fromDeposits: amountFromDeposits } : {}),
        ...(amountFromLends.isPositive() ? { fromLends: amountFromLends } : {}),
      })

      setIsConfirming(false)
      onClose()
      return
    }
  }, [account, amount, amountInDeposits, modal?.type, onClose, perpsVault])

  if (!modal || !asset) return null

  return (
    <ModalContentWithSummary
      isContentCard
      subHeader={<SubHeader />}
      headerClassName='p-0'
      account={account}
      content={
        <>
          <TokenInputWithSlider
            disabled={isConfirming}
            asset={asset}
            amount={amount}
            onChange={setAmount}
            max={maxAmount}
            warningMessages={[]}
            maxText='Available'
          />
          <Callout description='Please note there is an unlocking period of 7 days when depositing into this vault.' />
          <Button
            onClick={handleClick}
            rightIcon={<ArrowRight />}
            showProgressIndicator={isConfirming}
            disabled={isConfirming}
          >
            {modal.type === 'deposit' ? 'Deposit' : 'Request unlock'}
          </Button>
        </>
      }
      header={<Header asset={asset} />}
      onClose={onClose}
    />
  )
}
