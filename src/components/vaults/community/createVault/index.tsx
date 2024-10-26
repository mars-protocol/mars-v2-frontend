import AssetSelectContent from 'components/vaults/community/createVault/AssetSelectContent'
import Button from 'components/common/Button'
import CreateVaultContent from 'components/vaults/community/createVault/CreateVaultContent'
import MintVaultAccount from 'components/vaults/community/createVault/MintVaultAccount'
import DisplayCurrency from 'components/common/DisplayCurrency'
import VaultInputElement from 'components/vaults/community/createVault/VaultInputElement'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import HlsSwitch from 'components/vaults/community/createVault/HLSSwitch'
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
import TextArea from 'components/common/TextArea'
import useAccountId from 'hooks/accounts/useAccountId'
import CharacterCount from 'components/common/CharacterCount'

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
  const [description, setDescription] = useState<string>('')

  const assets = useWhitelistedAssets()
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0])

  const [enableHlsVault, setEnableHlsVault] = useState<boolean>(false)
  const [showMenu, setShowMenu] = useToggle()
  const accountId = useAccountId()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)

  const navigate = useNavigate()

  const handleCreate = useCallback(() => {
    // TODO: Implement create vault logic
    //  await for the response. once I have the response with the vault address, proceed to next page
    // if user filled out the vault details, store them

    // temp vault address
    const tempVaultAddress = 'tempvaultaddress'

    if (accountId)
      navigate(
        getRoute(
          getPage(`vaults/${tempVaultAddress}/mint-account`),
          searchParams,
          address,
          accountId,
        ),
      )

    useStore.setState({
      focusComponent: {
        component: <MintVaultAccount />,
        onClose: () => {
          navigate(getRoute(getPage(pathname), searchParams, address))
        },
      },
    })
  }, [navigate, pathname, searchParams, address, accountId])

  const handleWithdrawFreezePeriod = useCallback((value: string) => {
    setWithdrawFreezePeriod(value)
  }, [])

  const handleHlsSwitch = useCallback((value: boolean) => {
    setEnableHlsVault(value)
  }, [])

  const handleSelectAssets = useCallback(() => {
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
            <AssetSelectContent
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
              onChange={handleWithdrawFreezePeriod}
              label='Withdraw Freeze Period'
            />

            <div>
              <label className='text-xs flex items-center'>
                Description
                <span className='text-primary ml-1'>*</span>
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
