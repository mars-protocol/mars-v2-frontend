import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { ArrowRight } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { Callout, CalloutType } from 'components/common/Callout'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import { byDenom } from 'utils/array'
import { useState } from 'react'
import { BN_ZERO } from 'constants/math'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { formatLockupPeriod } from 'utils/formatters'
import moment from 'moment'

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

  const depositInManagedVault = useStore((s) => s.depositInManagedVault)

  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_token)) as Asset
  const assetAmountInWallet = BN(useCurrentWalletBalance(vaultDetails.base_token)?.amount || '0')

  const isDeposit = type === 'deposit'

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
            max={assetAmountInWallet}
            disabled={assetAmountInWallet.isZero()}
            className='w-full'
            maxText={isDeposit ? 'In Wallet' : 'Available to Withdraw'}
            warningMessages={[]}
          />
          <Divider className='my-2' />

          <div className='space-y-2'>
            <Callout type={CalloutType.INFO}>
              {isDeposit
                ? 'Please note that deposited funds come directly from your wallet. Your credit account will not be affected.'
                : 'Once you initiate this withdrawal, it will take 24 hours to become available.'}
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
            onClick={handleDeposit}
            className='w-full'
            text={isDeposit ? 'Deposit' : 'Withdraw'}
            rightIcon={<ArrowRight />}
            disabled={amount.isZero()}
          />
        </Card>
      </div>
    </Overlay>
  )
}
