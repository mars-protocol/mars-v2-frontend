import { useCallback, useMemo, useState } from 'react'
import { useSWRConfig } from 'swr'

import Button from 'components/common/Button'
import { Callout } from 'components/common/Callout'
import { ArrowRight } from 'components/common/Icons'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import { Header } from 'components/Modals/PerpsVault/Header'
import { SubHeader } from 'components/Modals/PerpsVault/SubHeader'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAsset from 'hooks/assets/useAsset'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'
import { BN } from 'utils/helpers'

export default function PerpsVaultModal() {
  const chainConfig = useChainConfig()
  const modal = useStore((s) => s.perpsVaultModal)
  const account = useCurrentAccount()
  const [amount, setAmount] = useState(BN(0))
  const [isConfirming, setIsConfirming] = useState(false)
  const { mutate } = useSWRConfig()

  const { data: perpsVault } = usePerpsVault()
  const asset = useAsset(perpsVault?.denom || '')

  const [amountInDeposits, maxAmount] = useMemo(() => {
    if (!account) return [BN(0), BN(0), BN(0)]

    if (modal?.type === 'deposit') {
      const amountInDeposits =
        account.deposits.find((d) => d.denom === perpsVault?.denom)?.amount || BN(0)
      const amountInLends =
        account.lends.find((d) => d.denom === perpsVault?.denom)?.amount || BN(0)

      return [amountInDeposits, amountInDeposits.plus(amountInLends)]
    }

    return [BN_ZERO, account.perpVault?.active?.amount ?? BN_ZERO]
  }, [account, modal?.type, perpsVault?.denom])

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
        ...(!amountFromDeposits.isZero() ? { fromDeposits: amountFromDeposits } : {}),
        ...(!amountFromLends.isZero() ? { fromLends: amountFromLends } : {}),
      })
    }

    const activeVaultPosition = account.perpVault?.active

    if (modal?.type === 'unlock' && activeVaultPosition) {
      const percentageOfMax = amount.div(activeVaultPosition.amount)
      const amountOfShares = percentageOfMax.times(activeVaultPosition.shares)
      await useStore.getState().requestUnlockPerpsVault({
        accountId: account.id,
        amount: amountOfShares.integerValue(),
      })
    }

    setIsConfirming(false)
    setAmount(BN_ZERO)
    await mutate(`chains/${chainConfig.id}/accounts/${account.id}`)
    await mutate(`chains/${chainConfig.id}/vaults/${account.id}/deposited`)
    onClose()
    return
  }, [account, amount, amountInDeposits, chainConfig.id, modal?.type, mutate, onClose, perpsVault])

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
          <div className='gap-4 flex flex-col'>
            {modal.type === 'deposit' && (
              <>
                <Callout>
                  Please note there is an unlocking period of 7 days when depositing into this
                  vault.
                </Callout>
                <Callout>
                  Your overall leverage may be increased as any deposits into this vault are removed
                  from your total collateral value.
                </Callout>
              </>
            )}
            <Button
              onClick={handleClick}
              rightIcon={<ArrowRight />}
              showProgressIndicator={isConfirming}
              disabled={isConfirming || amount.isZero()}
            >
              {modal.type === 'deposit' ? 'Deposit' : 'Request unlock'}
            </Button>
          </div>
        </>
      }
      header={<Header asset={asset} />}
      onClose={onClose}
    />
  )
}
