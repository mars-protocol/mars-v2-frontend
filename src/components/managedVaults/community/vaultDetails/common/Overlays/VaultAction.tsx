import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import moment from 'moment'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import { ArrowRight } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { BN_ZERO } from 'constants/math'
import { byDenom } from 'utils/array'
import { Callout, CalloutType } from 'components/common/Callout'
import { formatLockupPeriod } from 'utils/formatters'
import { useMemo, useState } from 'react'
import { useManagedVaultUserDeposits } from 'hooks/managedVaults/useManagedVaultUserDeposits'
import { useManagedVaultWithdrawalPreview } from 'hooks/managedVaults/useManagedVaultWithdrawalPreview'
import useAccount from 'hooks/accounts/useAccount'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'

interface Props {
  showActionModal: boolean
  setShowActionModal: (show: boolean) => void
  vaultDetails: ExtendedManagedVaultDetails
  vaultAddress: string
  type: 'deposit' | 'withdraw'
}

export default function VaultAction(props: Props) {
  const { showActionModal, setShowActionModal, vaultDetails, vaultAddress, type } = props

  const [amount, setAmount] = useState(BN_ZERO)
  const address = useStore((s) => s.address)
  const { data: accountData } = useAccount(vaultDetails.vault_account_id || undefined)
  const { amount: userVaultTokens } = useManagedVaultUserDeposits(address, vaultDetails.vault_token)
  const { data: previewAmount, isLoading: isPreviewLoading } = useManagedVaultWithdrawalPreview(
    vaultAddress,
    userVaultTokens,
  )
  const { computeMaxWithdrawAmount } = useHealthComputer(accountData)
  const depositInManagedVault = useStore((s) => s.depositInManagedVault)
  const unlockFromManagedVault = useStore((s) => s.unlockFromManagedVault)
  const isDeposit = type === 'deposit'
  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_token)) as Asset
  const assetAmountInWallet = BN(useCurrentWalletBalance(vaultDetails.base_token)?.amount || '0')

  const maxAmount = useMemo(() => {
    if (isDeposit) {
      return assetAmountInWallet
    }

    const preview = BN(previewAmount || '0')
    const healthComputerLimit = computeMaxWithdrawAmount(vaultDetails.base_token)

    return preview.isLessThan(healthComputerLimit) ? preview : healthComputerLimit
  }, [
    isDeposit,
    assetAmountInWallet,
    previewAmount,
    computeMaxWithdrawAmount,
    vaultDetails.base_token,
  ])

  const handleAmountChange = (newAmount: BigNumber) => {
    setAmount(newAmount)
  }

  const handleDeposit = async () => {
    if (amount.isZero()) return

    try {
      await depositInManagedVault({
        vaultAddress,
        amount: amount.toString(),
      })
      setShowActionModal(false)
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  const handleUnlock = async () => {
    if (amount.isZero()) return

    try {
      await unlockFromManagedVault({
        vaultAddress,
        amount: amount.toString(),
        vaultToken: vaultDetails.vault_token,
      })
      setShowActionModal(false)
    } catch (error) {
      console.error('Unlock failed:', error)
    }
  }

  return (
    <Overlay
      setShow={setShowActionModal}
      show={showActionModal}
      className='fixed md:absolute top-[40vh] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-140 h-auto overflow-hidden !bg-body'
    >
      <div className='flex items-center justify-between gradient-header py-2.5 px-4'>
        <Text size='lg'>{isDeposit ? 'Deposit' : 'Withdraw'}</Text>
        <EscButton onClick={() => setShowActionModal(false)} enableKeyPress />
      </div>

      <Divider />

      <div className='p-2 md:p-6 mb-4 w-full h-full max-w-screen-full'>
        <Card className='p-4 bg-white/5' contentClassName='flex flex-col justify-between gap-4'>
          <TokenInputWithSlider
            asset={depositAsset}
            onChange={handleAmountChange}
            amount={amount}
            max={maxAmount}
            disabled={maxAmount.isZero() || isPreviewLoading}
            className='w-full'
            maxText={isDeposit ? 'In Wallet' : 'Available to Withdraw'}
            warningMessages={[]}
          />
          <Divider className='my-2' />

          <div className='space-y-2'>
            <Callout type={CalloutType.INFO}>
              {isDeposit
                ? 'Please note that deposited funds come directly from your wallet. Your credit account will not be affected.'
                : `Once you initiate this withdrawal, it will take ${formatLockupPeriod(
                    moment.duration(vaultDetails.cooldown_period, 'seconds').as('days'),
                    'days',
                  )} to become available.`}
            </Callout>
            {isDeposit && (
              <Callout type={CalloutType.INFO}>
                Please note there is a{' '}
                {formatLockupPeriod(
                  moment.duration(vaultDetails.cooldown_period, 'seconds').as('days'),
                  'days',
                )}{' '}
                withdrawal freeze.
              </Callout>
            )}
          </div>

          <Button
            onClick={isDeposit ? handleDeposit : handleUnlock}
            className='w-full'
            text={isDeposit ? 'Deposit' : 'Withdraw'}
            rightIcon={<ArrowRight />}
            disabled={amount.isZero() || maxAmount.isZero()}
          />
        </Card>
      </div>
    </Overlay>
  )
}
