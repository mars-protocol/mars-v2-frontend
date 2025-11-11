import BigNumber from 'bignumber.js'
import Button from 'components/common/Button'
import EscButton from 'components/common/Button/EscButton'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/accounts/useAccount'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { useManagedVaultConvertToShares } from 'hooks/managedVaults/useManagedVaultConvertToShares'
import { useManagedVaultConvertToBaseTokens } from 'hooks/managedVaults/useManagedVaultConvertToBaseTokens'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import moment from 'moment'
import { useMemo, useState } from 'react'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { formatLockupPeriod } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { useUserUnlocks } from 'hooks/managedVaults/useUserUnlocks'
import useManagedVaultUserPosition from 'hooks/managedVaults/useManagedVaultUserPosition'

type VaultAction = 'deposit' | 'unlock'
interface Props {
  showActionModal: boolean
  setShowActionModal: (show: boolean) => void
  vaultDetails: ManagedVaultsData
  vaultAddress: string
  type: VaultAction
}

export default function VaultAction(props: Props) {
  const { showActionModal, setShowActionModal, vaultDetails, vaultAddress, type } = props

  const [inputAmount, setInputAmount] = useState(BN_ZERO)
  const [isConfirming, setIsConfirming] = useState(false)
  const address = useStore((s) => s.address)
  const { data: account } = useAccount(vaultDetails.vault_account_id || undefined)
  const { data: userPosition } = useManagedVaultUserPosition(vaultAddress, address)
  const { data: userUnlocks = [] } = useUserUnlocks(vaultAddress)
  const { data: sharesToUnlock } = useManagedVaultConvertToShares(
    vaultAddress,
    inputAmount.toFixed(0),
  )
  const { computeMaxWithdrawAmount, computeMaxBorrowAmount } = useHealthComputer(account)
  const depositInManagedVault = useStore((s) => s.depositInManagedVault)
  const unlockFromManagedVault = useStore((s) => s.unlockFromManagedVault)
  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_tokens_denom)) as Asset
  const baseTokenWalletBalance = BN(
    useCurrentWalletBalance(vaultDetails.base_tokens_denom)?.amount || '0',
  )
  const isDeposit = type === 'deposit'

  const pendingUnlockShares = useMemo(() => {
    return userUnlocks.reduce((total, unlock) => {
      return total.plus(BN(unlock.vault_tokens_amount))
    }, BN_ZERO)
  }, [userUnlocks])

  const maxUnlockableShares = useMemo(() => {
    if (!userPosition?.shares) return BN_ZERO
    return BigNumber.maximum(BN(userPosition.shares).minus(pendingUnlockShares), BN_ZERO)
  }, [userPosition?.shares, pendingUnlockShares])

  const { data: maxUnlockableBaseTokens, isLoading } = useManagedVaultConvertToBaseTokens(
    vaultAddress,
    maxUnlockableShares.toString(),
  )

  const maxInputAmount = useMemo(() => {
    if (isDeposit) {
      return baseTokenWalletBalance
    }

    const shareBasedLimit = BN(maxUnlockableBaseTokens || 0)
    const maxWithdrawAmount = computeMaxWithdrawAmount(vaultDetails.base_tokens_denom)
    const maxBorrowAmount = computeMaxBorrowAmount(vaultDetails.base_tokens_denom, 'wallet')
    const totalMaxWithdrawAmount = maxWithdrawAmount.plus(maxBorrowAmount)

    return BigNumber.maximum(BigNumber.minimum(shareBasedLimit, totalMaxWithdrawAmount), BN_ZERO)
  }, [
    baseTokenWalletBalance,
    computeMaxBorrowAmount,
    computeMaxWithdrawAmount,
    isDeposit,
    vaultDetails.base_tokens_denom,
    maxUnlockableBaseTokens,
  ])

  const withdrawalPeriod = formatLockupPeriod(
    moment.duration(vaultDetails.cooldown_period, 'seconds').as('days'),
    'days',
  )

  const handleAmountChange = (newAmount: BigNumber) => {
    setInputAmount(BigNumber.maximum(newAmount, BN_ZERO))
  }

  const handleAction = async (type: VaultAction) => {
    if (inputAmount.isZero()) return

    setIsConfirming(true)
    try {
      if (type === 'unlock') {
        if (!sharesToUnlock) return
        const finalSharesToSend = BigNumber.minimum(
          BN(sharesToUnlock),
          maxUnlockableShares,
        ).toFixed(0)

        await unlockFromManagedVault({
          vaultAddress,
          amount: finalSharesToSend,
          vaultToken: vaultDetails.vault_tokens_denom,
        })
      } else {
        await depositInManagedVault({
          vaultAddress,
          amount: inputAmount.toFixed(0),
          baseTokenDenom: vaultDetails.base_tokens_denom,
        })
      }
    } catch (error) {
      console.error(`${type === 'unlock' ? 'Unlock' : 'Deposit'} failed:`, error)
    } finally {
      setIsConfirming(false)
      setShowActionModal(false)
      setInputAmount(BN_ZERO)
    }
  }

  const handleCloseModal = () => {
    setShowActionModal(false)
    setInputAmount(BN_ZERO)
  }

  return (
    <Overlay
      setShow={handleCloseModal}
      show={showActionModal}
      className='fixed md:absolute top-[40vh] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-140 h-auto overflow-hidden bg-body!'
    >
      <div className='flex items-center justify-between bg-surface-dark py-2.5 px-4'>
        <Text size='lg'>{isDeposit ? 'Deposit' : 'Unlock'}</Text>
        <EscButton onClick={handleCloseModal} enableKeyPress />
      </div>

      <Divider />

      <div className='p-2 md:p-6 mb-4 w-full h-full max-w-screen-full'>
        <Card className='p-4 bg-white/5' contentClassName='flex flex-col justify-between gap-4'>
          <TokenInputWithSlider
            asset={depositAsset}
            onChange={handleAmountChange}
            amount={inputAmount}
            max={maxInputAmount}
            disabled={maxInputAmount.isZero() || isLoading || isConfirming}
            className='w-full'
            maxText={isDeposit ? 'In Wallet' : 'Available to Withdraw'}
            warningMessages={[]}
            deductFee={isDeposit}
          />
          <Divider className='my-2' />

          <div className='space-y-2'>
            {isDeposit ? (
              <>
                <Callout type={CalloutType.INFO}>
                  Please note that deposited funds come directly from your wallet. Your credit
                  account will not be affected.
                </Callout>
                <Callout type={CalloutType.INFO}>
                  Please note there is a {withdrawalPeriod} withdrawal freeze.
                </Callout>
              </>
            ) : (
              <>
                <Callout type={CalloutType.INFO}>
                  Please note there is a {withdrawalPeriod} withdrawal freeze.
                </Callout>
                {maxUnlockableBaseTokens &&
                  BN(maxUnlockableBaseTokens).isGreaterThan(maxInputAmount) && (
                    <Callout type={CalloutType.WARNING}>
                      The vault currently has insufficient {depositAsset?.symbol} to process your
                      full withdrawal. Please try withdrawing a smaller amount or contact the vault
                      owner.
                    </Callout>
                  )}
              </>
            )}
          </div>

          <Button
            onClick={() => handleAction(isDeposit ? 'deposit' : 'unlock')}
            className='w-full'
            text={isDeposit ? 'Deposit' : 'Unlock'}
            rightIcon={<ArrowRight />}
            disabled={inputAmount.isZero() || maxInputAmount.isZero() || isConfirming}
            showProgressIndicator={isConfirming}
          />
        </Card>
      </div>
    </Overlay>
  )
}
