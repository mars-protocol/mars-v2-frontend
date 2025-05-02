import Button from 'components/common/Button'
import CharacterCount from 'components/common/CharacterCount'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { ArrowRight, ArrowUpLine, InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import TextArea from 'components/common/TextArea'
import { TextLink } from 'components/common/TextLink'
import CreateVaultContent from 'components/managedVaults/createVault/CreateVaultContent'
import PerformanceFee from 'components/managedVaults/createVault/PerformanceFee'
import VaultInputElement from 'components/managedVaults/createVault/VaultInputElement'
import useAccountId from 'hooks/accounts/useAccountId'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'
import Overlay from 'components/common/Overlay'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import EscButton from 'components/common/Button/EscButton'

const options = [
  { label: '24 hours', value: '24' },
  { label: '48 hours', value: '48' },
  { label: '72 hours', value: '72' },
  { label: '5 days', value: '120' },
  { label: '7 days', value: '168' },
  { label: '14 days', value: '336' },
]

export default function CreateVault() {
  const selectableAssets = useVaultAssets()
  const chainConfig = useChainConfig()
  const { open: showAlertDialog } = useAlertDialog()
  const defaultAsset = useMemo(
    () =>
      selectableAssets.find((asset) => asset.denom === chainConfig.stables[0]) ??
      selectableAssets[0],
    [selectableAssets, chainConfig.stables],
  )
  const [withdrawFreezePeriod, setWithdrawFreezePeriod] = useState<string>('24')
  const [isTxPending, setIsTxPending] = useState<boolean>(false)
  const [description, setDescription] = useState<string>('')
  const [vaultTitle, setVaultTitle] = useState<string>('')
  const [performanceFee, setPerformanceFee] = useState<BigNumber>(BN(1))
  const [searchParams] = useSearchParams()
  const accountId = useAccountId()
  const address = useStore((s) => s.address)
  const navigate = useNavigate()
  const createManagedVault = useStore((s) => s.createManagedVault)
  const selectedDenom = useStore((s) => s.vaultAssetsModal?.selectedDenom) ?? defaultAsset.denom
  const [amount, setAmount] = useState(BN_ZERO)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const createAccount = useStore((s) => s.createAccount)

  const selectedAsset = useMemo(() => {
    return selectableAssets.find(byDenom(selectedDenom)) ?? defaultAsset
  }, [selectableAssets, defaultAsset, selectedDenom])

  const isFormValid = () => {
    return vaultTitle.trim() !== '' && description.trim() !== '' && selectedAsset !== null
  }

  const handleMintVaultAddress = useCallback(async () => {
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

            if (result.address && accountId) {
              const accountKind = {
                fund_manager: {
                  vault_addr: result.address,
                },
              }
              const accountId = await createAccount(accountKind, false)

              console.log('accountId', accountId)
              if (!accountId) {
                setIsTxPending(false)
                return
              }

              navigate(
                getRoute(
                  getPage(`vaults/${result.address}/details`, chainConfig),
                  searchParams,
                  address,
                  accountId,
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
    showAlertDialog,
    vaultTitle,
    description,
    selectedAsset,
    withdrawFreezePeriod,
    performanceFee,
    createManagedVault,
    accountId,
    navigate,
    chainConfig,
    searchParams,
    address,
    createAccount,
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

  const handleDepositPopup = useCallback(() => {
    setShowDepositModal(true)
  }, [])

  const handleDepositAction = async () => {}

  return (
    <CreateVaultContent>
      <form className='flex flex-col flex-grow space-y-6'>
        <div className='flex flex-col gap-8 md:flex-row'>
          <div className='flex-1 space-y-8'>
            <div className='space-y-2'>
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
              <PerformanceFee value={performanceFee} onChange={setPerformanceFee} />
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
          </div>

          <div className='border border-white/5' />

          <div className='flex-1 space-y-8'>
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

            <div className='flex flex-wrap w-full'>
              <Text size='sm' className='w-full mb-2'>
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
        </div>

        <div className='border border-white/5' />

        <div className='flex flex-wrap items-center justify-between gap-2 px-4 md:px-0'>
          <div className='space-y-2'>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleDepositPopup()
              }}
              size='md'
              rightIcon={<ArrowUpLine />}
              className='w-full md:w-70'
              text='Deposit'
              disabled={isTxPending}
              showProgressIndicator={isTxPending}
            />
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault()
              handleMintVaultAddress()
            }}
            size='md'
            rightIcon={<ArrowRight />}
            className='w-full md:w-70'
            text='Mint Vault Address'
            disabled={isTxPending || !isFormValid()}
            showProgressIndicator={isTxPending}
          />
        </div>
      </form>

      <Overlay
        setShow={setShowDepositModal}
        show={showDepositModal}
        className='fixed md:absolute top-[40vh] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-140 h-auto overflow-hidden !bg-body'
      >
        <div className='flex items-center justify-between gradient-header py-2.5 px-4'>
          <Text size='lg'>Deposit</Text>
          <EscButton onClick={() => setShowDepositModal(false)} enableKeyPress />
        </div>

        <Divider />

        <div className='p-2 md:p-6 mb-4 w-full h-full max-w-screen-full'>
          <Card className='p-4 bg-white/5' contentClassName='flex flex-col justify-between gap-4'>
            <TokenInputWithSlider
              asset={selectedAsset}
              onChange={handleAmountChange}
              amount={amount}
              max={BN(1000)} //temp
              disabled={isTxPending}
              className='w-full'
              maxText='In Wallet'
              warningMessages={[]}
            />
            <Divider className='my-2' />

            <Button
              onClick={handleDepositAction}
              className='w-full'
              text='Deposit'
              rightIcon={<ArrowRight />}
              disabled={amount.isZero() || isTxPending}
              showProgressIndicator={isTxPending}
            />
          </Card>
        </div>
      </Overlay>
    </CreateVaultContent>
  )
}
