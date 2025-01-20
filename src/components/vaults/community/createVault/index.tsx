import Button from 'components/common/Button'
import CharacterCount from 'components/common/CharacterCount'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import TextArea from 'components/common/TextArea'
import { TextLink } from 'components/common/TextLink'
import CreateVaultContent from 'components/vaults/community/createVault/CreateVaultContent'
import HlsSwitch from 'components/vaults/community/createVault/HLSSwitch'
import MintVaultAccount from 'components/vaults/community/createVault/MintVaultAccount'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import VaultInputElement from 'components/vaults/community/createVault/VaultInputElement'
import useAccountId from 'hooks/accounts/useAccountId'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'

const options = [
  { label: '24 hours', value: '24' },
  { label: '48 hours', value: '48' },
  { label: '72 hours', value: '72' },
  { label: '5 days', value: '120' },
  { label: '7 days', value: '168' },
  { label: '14 days', value: '336' },
]

export default function CreateVault() {
  const assets = useVaultAssets()
  const chainConfig = useChainConfig()
  const defaultAsset = useMemo(
    () => assets.find((asset) => asset.denom === chainConfig.stables[0]) ?? assets[0],
    [assets, chainConfig.stables],
  )
  const [withdrawFreezePeriod, setWithdrawFreezePeriod] = useState<string>('24')
  const [enableHlsVault, setEnableHlsVault] = useState<boolean>(false)
  const [isTxPending, setIsTxPending] = useState<boolean>(false)
  const [description, setDescription] = useState<string>('')
  const [vaultTitle, setVaultTitle] = useState<string>('')
  const [performanceFee, setPerformanceFee] = useState<BigNumber>(BN(1))
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const accountId = useAccountId()
  const address = useStore((s) => s.address)
  const navigate = useNavigate()
  const createManagedVault = useStore((s) => s.createManagedVault)
  const selectedDenom = useStore((s) => s.vaultAssetsModal?.selectedDenom) ?? defaultAsset.denom

  const selectedAsset = useMemo(() => {
    return assets.find(byDenom(selectedDenom)) ?? defaultAsset
  }, [assets, defaultAsset, selectedDenom])

  const selectableAssets = useMemo(() => {
    return enableHlsVault ? assets.filter((asset) => asset.isStaking) : assets
  }, [assets, enableHlsVault])

  const isFormValid = () => {
    return vaultTitle.trim() !== '' && description.trim() !== '' && selectedAsset !== null
  }

  const handleMintVaultAddress = useCallback(async () => {
    try {
      setIsTxPending(true)

      const feeRate = performanceFee.dividedBy(100).dividedBy(1000).toFixed(5)

      const vaultParams = {
        title: vaultTitle,
        description: description,
        baseToken: selectedAsset.denom,
        withdrawFreezePeriod: Number(withdrawFreezePeriod) * 3600,
        enableHls: enableHlsVault,
        performanceFee: {
          fee_rate: feeRate,
          withdrawal_interval: 24 * 3600,
        },
        vault_token_subdenom: `vault_${selectedAsset.symbol.toLowerCase()}`,
      }

      const result = await createManagedVault(vaultParams)

      if (!result) return

      if (result.address) {
        if (accountId)
          navigate(
            getRoute(
              getPage(`vaults/${result.address}/mint-account`, chainConfig),
              searchParams,
              address,
              accountId,
            ),
          )
      }
      useStore.setState({
        focusComponent: {
          component: <MintVaultAccount />,
          onClose: () => {
            navigate(getRoute(getPage(pathname, chainConfig), searchParams, address))
          },
        },
      })
    } catch (error) {
      console.error('Failed to create vault:', error)
    } finally {
      setIsTxPending(false)
    }
  }, [
    vaultTitle,
    description,
    selectedAsset,
    withdrawFreezePeriod,
    enableHlsVault,
    performanceFee,
    createManagedVault,
    accountId,
    navigate,
    chainConfig,
    searchParams,
    address,
    pathname,
  ])

  const handleWithdrawFreezePeriod = useCallback((value: string) => {
    setWithdrawFreezePeriod(value)
  }, [])

  const handleHlsSwitch = useCallback((value: boolean) => {
    setEnableHlsVault(value)
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

  return (
    <CreateVaultContent>
      <form className='flex flex-col flex-grow space-y-6'>
        <div className='flex flex-col gap-8 md:flex-row'>
          <div className='flex-1 space-y-8'>
            <VaultInputElement
              type='text'
              value={vaultTitle}
              onChange={(value) => setVaultTitle(value)}
              label='Vault title'
              placeholder='Enter vault title'
              required
            />
            <PerformanceFee value={performanceFee} onChange={setPerformanceFee} />
            <HlsSwitch onChange={handleHlsSwitch} name='enableHlsVault' value={enableHlsVault} />

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
            {/* TODO: fetch from contract */}
            <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(10))} />
            <Text size='sm' className='text-white/50'>
              Vault creation cost.
              <TextLink
                //   TODO: add link
                href=''
                target='_blank'
                title='Vault Creation Info'
                textSize='extraSmall'
                className='pl-1'
              >
                Learn more...
              </TextLink>
            </Text>
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault()
              handleMintVaultAddress()
            }}
            size='md'
            rightIcon={<ArrowRight />}
            className='w-full md:w-70'
            text='Mint Vault Address (1/2)'
            disabled={isTxPending || !isFormValid()}
            showProgressIndicator={isTxPending}
          />
        </div>
      </form>
    </CreateVaultContent>
  )
}
