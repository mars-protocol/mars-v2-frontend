import React from 'react'
import { useNavigate } from 'react-router-dom'
import FullOverlayContent from 'components/common/FullOverlayContent'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Text from 'components/common/Text'
import classNames from 'classnames'
import HLSSwitch from './createVault/HLSSwitch'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import Input from 'components/vaults/community/createVault/Input'
import { ArrowRight } from 'components/common/Icons'
import Divider from 'components/common/Divider'

const options = [
  { label: '24 hours', value: '24h' },
  { label: '48 hours', value: '48h' },
  { label: '72 hours', value: '72h' },
  { label: '5 days', value: '5d' },
  { label: '7 days', value: '7d' },
  { label: '14 days', value: '14d' },
]

export default function CreateVault() {
  const navigate = useNavigate()
  const isLoading = false

  const handleCreate = () => {
    // TODO: Implement create vault logic
    console.log('Create vault logic goes here.')

    // Close modal after action
    navigate('/vaults-community')
  }

  return (
    <FullOverlayContent
      title='Create Vault'
      copy='We’ll require you to authorise a transaction in your wallet in order to begin.'
      className='md:w-full max-w-[900px]'
    >
      <Card className='p-2 md:p-6 bg-white/5 w-full'>
        <form className='flex flex-col space-y-6 mb-4'>
          <div className='flex flex-col md:flex-row gap-5 md:gap-10 p-4'>
            <div className='flex-1 space-y-8'>
              <Input
                type='text'
                value={''}
                onChange={() => {}}
                label='Vault title'
                placeholder='Enter vault title'
              />

              <PerformanceFee />

              <HLSSwitch onChange={() => {}} value={false} />

              <Input
                type='dropdown'
                options={options}
                value={''}
                onChange={() => {}}
                label='Withdraw Freeze Period'
              />
            </div>
            <div className='border border-white/5' />
            {/* <Divider /> */}
            <div className='flex-1 space-y-8'>
              <Input
                type='dropdown'
                options={options}
                value={''}
                onChange={() => {}}
                label='Withdraw Freeze Period'
              />

              <Input
                type='textarea'
                value={''}
                onChange={() => {}}
                label='Description'
                placeholder='Enter a detailed description...'
                maxLength={240}
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
          {/* <div className='border border-white/5' /> */}
          <Divider />

          <div className='flex flex-wrap justify-between items-center px-4 gap-2'>
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
              onClick={() => {}}
              variant='solid'
              color='primary'
              size='md'
              rightIcon={<ArrowRight />}
              className='w-full md:w-auto'
              text='Create Vault Account (1/2)'
            />
          </div>
        </form>
      </Card>
    </FullOverlayContent>
  )
}
