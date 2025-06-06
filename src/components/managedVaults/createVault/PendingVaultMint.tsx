import Button from 'components/common/Button'
import classNames from 'classnames'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import VaultInputElement from 'components/managedVaults/createVault/VaultInputElement'
import { ArrowRight, ExternalLink } from 'components/common/Icons'
import { Callout, CalloutType } from 'components/common/Callout'
import { getPage, getRoute } from 'utils/route'
import { TextLink } from 'components/common/TextLink'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface Props {
  onClose: () => void
  pendingVault: PendingVaultData
}

const INITIAL_STEPS = [
  { number: 1, label: 'Create Vault', isActive: true },
  { number: 2, label: 'Mint Account', isActive: false },
  { number: 3, label: 'Initial Deposit', isActive: false },
]

export default function PendingVaultMint(props: Props) {
  const { onClose, pendingVault } = props

  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [isTxPending, setIsTxPending] = useState(false)
  const [manualVaultAddress, setManualVaultAddress] = useState('')

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const mintVaultAccount = useStore((s) => s.createAccount)
  const depositInManagedVault = useStore((s) => s.depositInManagedVault)

  const handleMintVaultAccount = async () => {
    const vaultAddress = pendingVault.vaultAddress || manualVaultAddress
    if (!vaultAddress) return
    if (address?.toLowerCase() !== pendingVault.creatorAddress?.toLowerCase()) {
      console.error('Only the vault creator can mint the vault account.')
      return
    }

    try {
      setIsTxPending(true)
      const accountKind = {
        fund_manager: {
          vault_addr: vaultAddress,
        },
      }
      const vaultAccountId = await mintVaultAccount(accountKind, false)

      if (!vaultAccountId) {
        return
      }

      const newSteps = steps.map((step, index) => ({
        ...step,
        isActive: index <= 1,
      }))
      setSteps(newSteps)

      localStorage.removeItem('pendingVaultMint')

      if (pendingVault.depositAmount) {
        await depositInManagedVault({
          vaultAddress: vaultAddress,
          amount: pendingVault.depositAmount,
          baseTokenDenom: pendingVault.baseTokenDenom,
        })

        const updatedSteps = steps.map((step, index) => ({
          ...step,
          isActive: index <= 2,
        }))
        setSteps(updatedSteps)
      }

      navigate(
        getRoute(
          getPage(`vaults/${vaultAddress}/details`, chainConfig),
          searchParams,
          address,
          vaultAccountId,
        ),
      )
    } catch (error) {
      console.error('Failed to mint vault account:', error)
    } finally {
      setIsTxPending(false)
    }
  }

  return (
    <Overlay
      show={true}
      setShow={onClose}
      className='fixed md:absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-120'
    >
      <div className='flex justify-end p-2 w-full'>
        <EscButton onClick={onClose} enableKeyPress />
      </div>
      <div className='px-8 pb-6 pt-4 flex flex-col justify-between gap-16 h-full'>
        <div className='flex justify-between items-center'>
          {steps.map((step, index) => (
            <div key={step.number} className='flex items-center'>
              <div className='flex flex-col items-center gap-2'>
                <div
                  className={classNames(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    step.isActive
                      ? 'border-2 border-purple bg-transparent'
                      : 'border border-white/20 bg-white/10',
                    'transition-colors',
                  )}
                >
                  <Text size='sm' className={step.isActive ? 'text-white' : 'text-white/60'}>
                    {step.number}
                  </Text>
                </div>
                <Text
                  size='sm'
                  className={classNames(
                    'text-center',
                    step.isActive ? 'text-white' : 'text-white/60',
                  )}
                >
                  {step.label}
                </Text>
              </div>
              {index < steps.length - 1 && <div className='w-16 h-[1px] bg-white/20 ml-2' />}
            </div>
          ))}
        </div>

        <div className='flex flex-col gap-4'>
          {!pendingVault.vaultAddress && (
            <div>
              <Callout type={CalloutType.WARNING}>
                We couldn't detect your vault address. Please paste it below to continue.
                <TextLink
                  href={''}
                  target='_blank'
                  textSize='extraSmall'
                  className='ml-1 text-white/50 hover:text-white'
                  title='How to get the vault address?'
                >
                  How to get your vault address?
                  <ExternalLink className='ml-1 inline w-3' />
                </TextLink>
              </Callout>

              <VaultInputElement
                type='text'
                value={manualVaultAddress}
                onChange={setManualVaultAddress}
                label=''
                placeholder='Enter vault address'
                required
              />
            </div>
          )}
          <Text size='sm' className='text-white/70 text-center'>
            Your vault has been created. Complete the remaining steps to finish the setup.
          </Text>

          <Button
            onClick={handleMintVaultAccount}
            size='md'
            rightIcon={<ArrowRight />}
            className='w-full'
            text='Continue Minting Vault'
            disabled={isTxPending || (!pendingVault.vaultAddress && !manualVaultAddress)}
            showProgressIndicator={isTxPending}
          />
        </div>
      </div>
    </Overlay>
  )
}
