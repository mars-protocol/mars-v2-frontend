import AssetSelect from 'components/vaults/community/createVault/AssetSelect'
import Button from 'components/common/Button'
import CreateVaultContent from 'components/vaults/community/createVault/CreateVaultContent'
import CreateVaultAccount from 'components/vaults/community/createVault/CreateVaultAccount'
import DisplayCurrency from 'components/common/DisplayCurrency'
import HlsSwitch from 'components/vaults/community/createVault/HLSSwitch'
import VaultInputElement from 'components/vaults/community/createVault/VaultInputElement'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import Text from 'components/common/Text'
import useToggle from 'hooks/common/useToggle'
import useStore from 'store'
import React, { useCallback, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'components/common/Icons'
import { getPage, getRoute } from 'utils/route'
import { TextLink } from 'components/common/TextLink'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'

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
  const [selectedAsset, setSelectedAsset] = useState({
    label: 'USDC',
    value: 'USDC',
  })

  const assets = useWhitelistedAssets()
  const [enableHlsVault, setEnableHlsVault] = useState<boolean>(false)
  const [showMenu, setShowMenu] = useToggle()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)

  const navigate = useNavigate()

  const handleCreate = useCallback(() => {
    // TODO: Implement create vault logic
    //  await for the response. once I have the response with the vault address, proceed to next page

    // temp vault address
    const tempVaultAddress = 'tempvaultaddress'

    const baseUrl = address
      ? `/wallets/${address}/vaults/${tempVaultAddress}/mint-account`
      : `/vaults/${tempVaultAddress}/mint-account`

    navigate(baseUrl)

    useStore.setState({
      focusComponent: {
        component: <CreateVaultAccount />,
        onClose: () => {
          navigate(getRoute(getPage(pathname), searchParams, address))
        },
      },
    })
  }, [navigate, pathname, searchParams, address])

  const handleWithdrawFreezePeriodChange = useCallback((value: string) => {
    setWithdrawFreezePeriod(value)
  }, [])

  const handleHlsSwitch = useCallback((value: boolean) => {
    setEnableHlsVault(value)
  }, [])

  const handleSelectAssetsClick = useCallback(() => {
    setShowMenu(true)
  }, [])

  return (
    <CreateVaultContent>
      <form className='flex flex-col space-y-6 mb-4'>
        <div className='flex flex-col md:flex-row gap-8'>
          <div className='flex-1 space-y-8'>
            <VaultInputElement
              type='text'
              // TODO: add value and onChange
              value={''}
              onChange={() => {}}
              label='Vault title'
              placeholder='Enter vault title'
              required
            />

            <PerformanceFee />

            <HlsSwitch onChange={handleHlsSwitch} name='enableHlsVault' value={enableHlsVault} />

            <VaultInputElement
              type='button'
              value={selectedAsset.label}
              onClick={handleSelectAssetsClick}
              label='Vault Deposit Asset'
              suffix={<ArrowRight />}
              required
            />
            <AssetSelect
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              assets={assets}
              setSelectedAsset={setSelectedAsset}
            />
          </div>

          <div className='border border-white/5' />

          <div className='flex-1 space-y-8'>
            <VaultInputElement
              type='dropdown'
              options={options}
              value={withdrawFreezePeriod}
              onChange={handleWithdrawFreezePeriodChange}
              label='Withdraw Freeze Period'
            />

            <VaultInputElement
              type='textarea'
              // TODO: add value and onChange
              value={''}
              onChange={() => {}}
              label='Description'
              placeholder='Enter a detailed description...'
              maxLength={240}
              required
            />
            <div className='flex flex-wrap w-full'>
              <Text size='sm' className='w-full mb-2'>
                Details of your vault
              </Text>
              <Text size='xs' className='text-white/50'>
                Setup your wallet with Stargaze or an IBC/ICNS Domain so that you can populate a
                profile image, name and social links.
              </Text>
            </div>
          </div>
        </div>

        <div className='border border-white/5' />

        <div className='flex flex-wrap justify-between items-center px-4 md:px-0 gap-2'>
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
            onClick={handleCreate}
            variant='solid'
            color='primary'
            size='md'
            rightIcon={<ArrowRight />}
            className='w-full md:w-auto'
            text='Create Vault Account (1/2)'
            // TODO: disable if form is not filled
            // disabled={}
          />
        </div>
      </form>
    </CreateVaultContent>
  )
}
