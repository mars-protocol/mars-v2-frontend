import Button from 'components/common/Button'
import CharacterCount from 'components/common/CharacterCount'
import CreateVaultContent from 'components/managedVaults/createVault/CreateVaultContent'
import PerformanceFee from 'components/managedVaults/createVault/PerformanceFee'
import Text from 'components/common/Text'
import TextArea from 'components/common/TextArea'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useChainConfig from 'hooks/chain/useChainConfig'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import VaultInputElement from 'components/managedVaults/createVault/VaultInputElement'
import { ArrowRight, InfoCircle } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { BN_ZERO } from 'constants/math'
import { byDenom } from 'utils/array'
import { Callout } from 'components/common/Callout'
import { CalloutType } from 'components/common/Callout'
import { getPage, getRoute } from 'utils/route'
import { TextLink } from 'components/common/TextLink'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const options = [
  { label: '24 hours', value: '24' },
  { label: '48 hours', value: '48' },
  { label: '72 hours', value: '72' },
  { label: '5 days', value: '120' },
  { label: '7 days', value: '168' },
  { label: '14 days', value: '336' },
]

export default function CreateVault() {
  const [withdrawFreezePeriod, setWithdrawFreezePeriod] = useState<string>('24')
  const [isTxPending, setIsTxPending] = useState<boolean>(false)
  const [description, setDescription] = useState<string>('')
  const [vaultTitle, setVaultTitle] = useState<string>('')
  const [performanceFee, setPerformanceFee] = useState<BigNumber>(BN(1))
  const [amount, setAmount] = useState(BN_ZERO)

  const selectableAssets = useVaultAssets()
  const chainConfig = useChainConfig()
  const { open: showAlertDialog } = useAlertDialog()
  const defaultAsset = useMemo(
    () =>
      selectableAssets.find((asset) => asset.denom === chainConfig.stables[0]) ??
      selectableAssets[0],
    [selectableAssets, chainConfig.stables],
  )

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const address = useStore((s) => s.address)
  const createManagedVault = useStore((s) => s.createManagedVault)
  const mintVaultAccount = useStore((s) => s.createAccount)
  const depositInManagedVault = useStore((s) => s.depositInManagedVault)
  const selectedDenom = useStore((s) => s.vaultAssetsModal?.selectedDenom) ?? defaultAsset.denom

  const selectedAsset = useMemo(() => {
    return selectableAssets.find(byDenom(selectedDenom)) ?? defaultAsset
  }, [selectableAssets, defaultAsset, selectedDenom])

  const isFormValid = () => {
    return vaultTitle.trim() !== '' && description.trim() !== ''
  }

  const assetAmountInWallet = BN(useCurrentWalletBalance(selectedAsset.denom)?.amount || '0')

  const handleCreateVaultAccount = useCallback(async () => {
    showAlertDialog({
      title: 'Create Vault',
      icon: <InfoCircle />,
      content: (
        <Text className='text-white/60'>
          Please note that once created, this vault will be immutable. While you can manage it
          through deposits, withdrawals and other operations, it cannot be deleted.
        </Text>
      ),
      positiveButton: {
        text: 'Continue',
        onClick: async () => {
          try {
            setIsTxPending(true)
            const annualRate = performanceFee.dividedBy(100)
            const hourlyRate = annualRate.dividedBy(8760)
            const feeRate = hourlyRate.decimalPlaces(18).toString()

            const vaultParams = {
              title: vaultTitle,
              description: description,
              baseToken: selectedAsset.denom,
              withdrawFreezePeriod: Number(withdrawFreezePeriod) * 3600,
              enableHls: false,
              performanceFee: {
                fee_rate: feeRate,
                withdrawal_interval: 24 * 3600,
              },
              vault_token_subdenom: `vault_${selectedAsset.symbol.toLowerCase()}`,
            }

            const result = await createManagedVault(vaultParams)

            if (!result) return

            if (result.address) {
              const accountKind = {
                fund_manager: {
                  vault_addr: result.address,
                },
              }
              const vaultAccountId = await mintVaultAccount(accountKind, false)

              if (!vaultAccountId) {
                setIsTxPending(false)
                return
              }

              const depositResult = await depositInManagedVault({
                vaultAddress: result.address,
                amount: amount.toString(),
              })

              if (!depositResult) {
                setIsTxPending(false)
                return
              }

              navigate(
                getRoute(
                  getPage(`vaults/${result.address}/details`, chainConfig),
                  searchParams,
                  address,
                  vaultAccountId,
                ),
              )
            }
          } catch (error) {
            console.error('Failed to create and mint vault:', error)
          } finally {
            setIsTxPending(false)
          }
        },
      },
      negativeButton: {
        text: 'Cancel',
      },
    })
  }, [
    address,
    amount,
    chainConfig,
    createManagedVault,
    depositInManagedVault,
    description,
    mintVaultAccount,
    navigate,
    performanceFee,
    searchParams,
    selectedAsset,
    showAlertDialog,
    vaultTitle,
    withdrawFreezePeriod,
  ])

  const handleWithdrawFreezePeriod = useCallback((value: string) => {
    setWithdrawFreezePeriod(value)
  }, [])

  const handleSelectAssets = useCallback(() => {
    useStore.setState({
      vaultAssetsModal: {
        isOpen: true,
        selectedDenom: selectedAsset.denom,
        assets: selectableAssets,
      },
    })
  }, [selectableAssets, selectedAsset.denom])

  const handleAmountChange = (newAmount: BigNumber) => {
    setAmount(newAmount)
  }

  return (
    <CreateVaultContent>
      <form className='flex flex-col space-y-6' onSubmit={(e) => e.preventDefault()}>
        <div className='flex flex-col gap-8 md:flex-row'>
          <div className='flex-1 space-y-2'>
            <div className='flex flex-col gap-2'>
              <VaultInputElement
                type='text'
                value={vaultTitle}
                onChange={(value) => setVaultTitle(value)}
                label='Vault title'
                placeholder='Enter vault title'
                maxLength={30}
                required
              />
              <CharacterCount value={vaultTitle} maxLength={30} size='xs' />
            </div>
            <VaultInputElement
              type='button'
              value={selectedAsset.symbol}
              asset={selectedAsset}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                handleSelectAssets()
              }}
              label='Vault Deposit Asset'
              suffix={<ArrowRight />}
              required
            />
            <div className='flex flex-col gap-5 pt-2'>
              <div className='space-y-3'>
                <Text size='xs' className='text-white'>
                  Deposit
                </Text>
                <TokenInputWithSlider
                  asset={selectedAsset}
                  onChange={handleAmountChange}
                  amount={amount}
                  max={assetAmountInWallet}
                  disabled={isTxPending}
                  className='w-full text-sm space-y-6'
                  maxText='In Wallet'
                  warningMessages={[]}
                />
              </div>
              <Callout type={CalloutType.INFO}>
                Optional deposit: Your vault won't appear in Community Vaults until it has a
                positive TVL.
              </Callout>
              <Text size='xs' className='text-white/50'>
                <span className='text-white'>Please note: </span>A $50 USD creation fee in your
                selected vault asset is required and goes straight to the protocol.
              </Text>
            </div>
          </div>

          <div className='border border-white/5' />

          <div className='flex-1 space-y-6'>
            <PerformanceFee value={performanceFee} onChange={setPerformanceFee} />

            <VaultInputElement
              type='dropdown'
              options={options}
              value={withdrawFreezePeriod}
              onChange={handleWithdrawFreezePeriod}
              label='Withdraw Freeze Period'
            />
            <div>
              <label className='flex items-center text-xs'>
                Description
                <span className='ml-1 text-primary'>*</span>
              </label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={240}
                placeholder='Enter a detailed description...'
                required
                footer={<CharacterCount value={description} maxLength={240} size='xs' />}
              />
            </div>
          </div>
        </div>

        <div className='border border-white/5' />

        <div className='flex flex-wrap items-center justify-between gap-2 px-4 md:px-0'>
          <div className='max-w-sm'>
            <div className='flex flex-wrap w-full'>
              <Text size='sm' className='w-full mb-1'>
                Details of your vault
              </Text>
              <Text size='xs' className='text-white/50'>
                Setup your wallet with{' '}
                <TextLink
                  href='https://www.stargaze.zone/names'
                  target='_blank'
                  title='Stargaze'
                  textSize='extraSmall'
                  className='text-white'
                >
                  Stargaze
                </TextLink>{' '}
                or an{' '}
                <TextLink
                  href='https://medium.com/@icns/announcing-icns-the-interchain-name-service-e61e0c3e2abb'
                  target='_blank'
                  title='Stargaze'
                  textSize='extraSmall'
                  className='text-white'
                >
                  IBC/ICNS Domain
                </TextLink>{' '}
                so that you can populate a profile image, name and social links.
              </Text>
            </div>
          </div>
          <Button
            onClick={handleCreateVaultAccount}
            size='md'
            rightIcon={<ArrowRight />}
            className='w-full md:w-70'
            text='Create Vault Account'
            disabled={isTxPending || !isFormValid()}
            showProgressIndicator={isTxPending}
          />
        </div>
      </form>
    </CreateVaultContent>
  )
}
