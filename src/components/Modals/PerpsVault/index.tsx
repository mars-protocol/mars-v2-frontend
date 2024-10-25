import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSWRConfig } from 'swr'

import ModalContentWithSummary from 'components/Modals/ModalContentWithSummary'
import { Header } from 'components/Modals/PerpsVault/Header'
import { SubHeader } from 'components/Modals/PerpsVault/SubHeader'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
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
  const [depositFromWallet, setDepositFromWallet] = useToggle()
  const walletAddress = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(walletAddress)

  const updateAmount = useCallback(
    (amount: BigNumber) => {
      setAmount(amount)

      if (!perpsVault?.denom) return
      if (props.modal.type === 'deposit') {
        simulatePerpsVaultDeposit(
          BNCoin.fromDenomAndBigNumber(perpsVault.denom, amount),
          depositFromWallet,
        )
      } else {
        simulatePerpsVaultUnlock(BNCoin.fromDenomAndBigNumber(perpsVault.denom, amount))
      }
    },
    [
      perpsVault?.denom,
      props.modal.type,
      simulatePerpsVaultDeposit,
      depositFromWallet,
      simulatePerpsVaultUnlock,
    ],
  )

  const [amountInDeposits, maxAmount] = useMemo(() => {
    if (!account || !perpsVault?.denom) return [BN(0), BN(0), BN(0)]

    if (props.modal.type === 'deposit') {
      const amountInDeposits =
        account.deposits.find((d) => d.denom === perpsVault.denom)?.amount || BN(0)
      const amountInLends = account.lends.find((d) => d.denom === perpsVault.denom)?.amount || BN(0)

      const maxAmount = depositFromWallet
        ? BN(walletBalances.find(byDenom(perpsVault.denom))?.amount ?? 0)
        : amountInDeposits.plus(amountInLends)

      return [amountInDeposits, maxAmount]
    }

    return [BN_ZERO, account.perpsVault?.active?.amount ?? BN_ZERO]
  }, [account, perpsVault?.denom, props.modal.type, depositFromWallet, walletBalances])

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
        ...(depositFromWallet ? { fromWallet: amount } : {}),
        ...(!amountFromDeposits.isZero() && !depositFromWallet
          ? { fromDeposits: amountFromDeposits }
          : {}),
        ...(!amountFromLends.isZero() && !depositFromWallet ? { fromLends: amountFromLends } : {}),
      })
    }

    const activeVaultPosition = account.perpsVault?.active

    if (props.modal.type === 'unlock' && activeVaultPosition) {
      const percentageOfMax = amount.div(activeVaultPosition.amount)
      const amountOfShares = percentageOfMax.times(activeVaultPosition.shares)
      await useStore.getState().requestUnlockPerpsVault({
        accountId: account.id,
        amount: amountOfShares.integerValue(),
      })
    }

    setIsConfirming(false)
    setAmount(BN_ZERO)
    onClose()
    return
  }, [account, perpsVault, props.modal.type, onClose, amount, amountInDeposits, depositFromWallet])

  useEffect(() => {
    if (!perpsVault?.denom) return
    const newAmount = amount.isGreaterThan(maxAmount) ? maxAmount : amount
    simulatePerpsVaultDeposit(
      BNCoin.fromDenomAndBigNumber(perpsVault.denom, newAmount),
      depositFromWallet,
    )
  }, [amount, depositFromWallet, maxAmount, perpsVault?.denom, simulatePerpsVaultDeposit])

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
          {props.modal.type === 'deposit' && perpsVault && (
            <>
              <Divider />
              <div className='flex items-center w-full'>
                <div className='flex flex-wrap flex-1'>
                  <Text className='w-full mb-1'>Deposit from Wallet</Text>
                  <Text size='xs' className='text-white/50'>
                    Deposit directly from your wallet
                  </Text>
                </div>
                <Switch
                  name='borrow-to-wallet'
                  checked={depositFromWallet}
                  onChange={setDepositFromWallet}
                />
              </div>

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
        </>
      }
      header={<Header asset={asset} />}
      onClose={onClose}
    />
  )
}
