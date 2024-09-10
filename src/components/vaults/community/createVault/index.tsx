import AssetSelect from 'components/vaults/community/createVault/AssetSelect'
import Button from 'components/common/Button'
import CreateVaultOverlay from 'components/vaults/community/createVault/CreateVaultOverlay'
import HLSSwitch from './HLSSwitch'
import Input from 'components/vaults/community/createVault/Input'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import Text from 'components/common/Text'
import useToggle from 'hooks/common/useToggle'
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'components/common/Icons'
import useStore from 'store'
import CreateVaultAccount from './CreateVaultAccount'

const options = [
  { label: '24 hours', value: '24' },
  { label: '48 hours', value: '48' },
  { label: '72 hours', value: '72' },
  { label: '5 days', value: '120' },
  { label: '7 days', value: '168' },
  { label: '14 days', value: '336' },
]
const assets = [
  { id: 1, label: 'USDC', value: 'USDC' },
  { id: 2, label: 'wBTC', value: 'wBTC' },
  { id: 3, label: 'wETH', value: 'wETH' },
  { id: 4, label: 'ATOM', value: 'ATOM' },
  { id: 5, label: 'NEUTRON', value: 'NEUTRON' },
]

export default function CreateVault() {
  const [withdrawFreezePeriod, setWithdrawFreezePeriod] = useState<string>('24')
  const [selectedAsset, setSelectedAsset] = useState({
    label: 'USDC',
    value: 'USDC',
  })

  const [enableHLSVault, setEnableHLSVault] = useState<boolean>(false)
  const [showMenu, setShowMenu] = useToggle()

  const navigate = useNavigate()

  const handleCreate = useCallback(() => {
    // TODO: Implement create vault logic

    console.log('Create vault logic goes here.')
    //  await for the response. once I have the response with the vault address, proceed to next page

    // temp vault address
    const tempVaultAddress = 'tempvaultaddress'

    navigate(`/vaults/${tempVaultAddress}/mint-account`)

    useStore.setState({
      focusComponent: {
        component: <CreateVaultAccount />,
        onClose: () => {
          navigate('/vaults-community')
        },
      },
    })
  }, [navigate])

  const handleWithdrawFreezePeriodChange = useCallback((value: string) => {
    setWithdrawFreezePeriod(value)
  }, [])

  const handleHLSSwitch = useCallback((value: boolean) => {
    setEnableHLSVault(value)
  }, [])

  const handleSelectAssetsClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // TODO
    e.preventDefault()
    setShowMenu(true)
  }, [])

  return (
    <CreateVaultOverlay>
      <form className='flex flex-col space-y-6 mb-4'>
        <div className='flex flex-col md:flex-row gap-8'>
          <div className='flex-1 space-y-8'>
            <Input
              type='text'
              value={''}
              onChange={() => {}}
              label='Vault title'
              placeholder='Enter vault title'
              required
            />

            <PerformanceFee />

            <HLSSwitch onChange={handleHLSSwitch} name='enableHLSVault' value={enableHLSVault} />

            <Input
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
            <Input
              type='dropdown'
              options={options}
              value={withdrawFreezePeriod}
              onChange={handleWithdrawFreezePeriodChange}
              label='Withdraw Freeze Period'
            />

            <Input
              type='textarea'
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
            <Text size='base' className='w-full'>
              $10
            </Text>
            <Text size='sm' className='text-white/50'>
              Vault creation cost.
              <span className='inline-block'>
                <Button
                  onClick={() => {}}
                  variant='transparent'
                  color='quaternary'
                  size='xs'
                  //   TODO: add link and update styling for the link
                  className='hover:underline'
                  text='Learn more...'
                />
              </span>
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
    </CreateVaultOverlay>
  )
}
