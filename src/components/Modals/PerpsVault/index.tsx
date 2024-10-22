import { useCallback, useMemo, useState } from 'react'
import { useSWRConfig } from 'swr'

import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import { Header } from 'components/Modals/PerpsVault/Header'
import { SubHeader } from 'components/Modals/PerpsVault/SubHeader'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import { ArrowRight } from 'components/common/Icons'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default function PerpsVaultModalController() {
  const modal = useStore((s) => s.perpsVaultModal)

  if (!modal) return null

  return <PerpsVaultModal modal={modal} />
}

type Props = {
  modal: PerpsVaultModal
}

function PerpsVaultModal(props: Props) {
  const chainConfig = useChainConfig()
  const account = useCurrentAccount()
  const [amount, setAmount] = useState(BN(0))
  const [isConfirming, setIsConfirming] = useState(false)
  const { mutate } = useSWRConfig()
  const { simulatePerpsVaultDeposit, simulatePerpsVaultUnlock } = useUpdatedAccount(account)
  const { data: perpsVault } = usePerpsVault()
  const asset = useAsset(perpsVault?.denom || '')

  const updateAmount = useCallback(
    (amount: BigNumber) => {
      setAmount(amount)

      if (!perpsVault?.denom) return
      if (props.modal.type === 'deposit') {
        simulatePerpsVaultDeposit(BNCoin.fromDenomAndBigNumber(perpsVault.denom, amount))
      } else {
        simulatePerpsVaultUnlock(BNCoin.fromDenomAndBigNumber(perpsVault.denom, amount))
      }
    },
    [props.modal.type, perpsVault?.denom, simulatePerpsVaultDeposit, simulatePerpsVaultUnlock],
  )

  const [amountInDeposits, maxAmount] = useMemo(() => {
    if (!account) return [BN(0), BN(0), BN(0)]

    if (props.modal.type === 'deposit') {
      const amountInDeposits =
        account.deposits.find((d) => d.denom === perpsVault?.denom)?.amount || BN(0)
      const amountInLends =
        account.lends.find((d) => d.denom === perpsVault?.denom)?.amount || BN(0)

      return [amountInDeposits, amountInDeposits.plus(amountInLends)]
    }

    return [BN_ZERO, account.perpsVault?.active?.amount ?? BN_ZERO]
  }, [account, props.modal.type, perpsVault?.denom])

  const onClose = useCallback(() => {
    useStore.setState({ perpsVaultModal: null })
    setAmount(BN_ZERO)
  }, [])

  const handleClick = useCallback(async () => {
    if (!account || !perpsVault) return
    setIsConfirming(true)

    useStore.setState({ perpsVaultModal: null })

    if (props.modal.type === 'deposit') {
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
      await mutate(`chains/${chainConfig.id}/vaults/${account.id}/deposited`)
    }

    const activeVaultPosition = account.perpsVault?.active

    if (props.modal.type === 'unlock' && activeVaultPosition) {
      const percentageOfMax = amount.div(activeVaultPosition.amount)
      const amountOfShares = percentageOfMax.times(activeVaultPosition.shares)
      await useStore.getState().requestUnlockPerpsVault({
        accountId: account.id,
        amount: amountOfShares.integerValue(),
      })
      await mutate(`chains/${chainConfig.id}/accounts/${account.id}`)
    }

    setIsConfirming(false)
    setAmount(BN_ZERO)
    await mutate(`chains/${chainConfig.id}/accounts/${account.id}`)
    await mutate(`chains/${chainConfig.id}/vaults/${account.id}/deposited`)
    onClose()
    return
  }, [
    account,
    amount,
    amountInDeposits,
    chainConfig.id,
    props.modal.type,
    mutate,
    onClose,
    perpsVault,
  ])

  if (!asset) return null

  return (
    <ModalContentWithSummary
      isContentCard
      subHeader={<SubHeader />}
      headerClassName='pl-2 pr-2.5 py-3'
      account={account}
      content={
        <>
          <TokenInputWithSlider
            disabled={isConfirming}
            asset={asset}
            amount={amount}
            onChange={updateAmount}
            max={maxAmount}
            warningMessages={[]}
            maxText='Available'
          />
          <div className='flex flex-col gap-4'>
            {props.modal.type === 'deposit' && perpsVault && (
              <>
                <Callout type={CalloutType.INFO}>
                  {`Please note there is an unlocking period of ${perpsVault.lockup.duration} ${perpsVault.lockup.timeframe} when depositing into this
                  vault.`}
                </Callout>
                <Callout type={CalloutType.INFO}>
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
              {props.modal.type === 'deposit' ? 'Deposit' : 'Request unlock'}
            </Button>
          </div>
        </>
      }
      header={<Header asset={asset} />}
      onClose={onClose}
    />
  )
}
